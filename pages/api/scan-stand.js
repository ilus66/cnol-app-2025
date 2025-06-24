import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
  const { visiteur_id, identifiant_badge, staff_id } = req.body;
  if (!visiteur_id || !identifiant_badge) {
    return res.status(400).json({ message: 'visiteur_id et identifiant_badge requis' });
  }

  try {
    let exposant_id;
    let staff_info = null;

    // Si staff_id est fourni, on récupère les infos du staff et de son exposant
    if (staff_id) {
      const { data: staff, error: staffError } = await supabase
        .from('staff_exposant')
        .select('*, exposants(id)')
        .eq('id', staff_id)
        .single();
      
      if (staffError || !staff) {
        return res.status(404).json({ message: 'Staff non trouvé.' });
      }
      
      exposant_id = staff.exposants.id;
      staff_info = staff;
    } else {
      // Logique existante pour l'exposant principal
      let exposantQuery = supabase
        .from('inscription')
        .select('id')
        .eq('participant_type', 'Exposant');
      
      const idMatch = identifiant_badge.match(/^cnol2025-(\d+)$/);
      if (idMatch) {
        const userId = parseInt(idMatch[1], 10);
        exposantQuery = exposantQuery.eq('id', userId);
      } else {
        exposantQuery = exposantQuery.eq('identifiant_badge', identifiant_badge);
      }

      const { data: exposant, error: findError } = await exposantQuery.single();
      
      if (findError || !exposant) {
        return res.status(404).json({ message: 'Badge Exposant non trouvé.' });
      }
      
      exposant_id = exposant.id;
    }

    // 2. Enregistrer le lead avec staff_id optionnel
    const leadData = {
      exposant_id: exposant_id,
      visiteur_id: visiteur_id,
    };
    
    if (staff_id) {
      leadData.staff_id = staff_id;
    }

    const { error: insertError } = await supabase
      .from('leads')
      .insert(leadData);

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(409).json({ message: 'Ce contact a déjà été scanné pour ce stand.' });
      }
      throw insertError;
    }

    res.status(200).json({ 
      message: 'Contact enregistré pour le stand !',
      staff_name: staff_info ? `${staff_info.prenom} ${staff_info.nom}` : null
    })
  } catch (error) {
    console.error('Erreur API /scan-stand:', error)
    res.status(500).json({ message: "Erreur lors de l'enregistrement du contact" })
  }
} 