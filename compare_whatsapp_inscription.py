# -*- coding: utf-8 -*-
import pandas as pd
import unidecode

def normalize_phone(phone):
    if pd.isna(phone):
        return ''
    num = ''.join(filter(str.isdigit, str(phone)))
    if num.startswith('0'):
        num = '212' + num[1:]
    elif not num.startswith('212'):
        num = '212' + num
    return '+' + num

# Charger les deux fichiers
# Place whatsapp.csv et inscription.csv à la racine du projet

df_whatsapp = pd.read_csv('whatsapp.csv', dtype=str)
df_inscription = pd.read_csv('inscription.csv', dtype=str)

# Normalisation
def normalize_colonnes(df):
    df['telephone'] = df['telephone'].fillna('').apply(normalize_phone)
    df['nom'] = df['nom'].fillna('').apply(lambda x: unidecode.unidecode(str(x)).strip().upper())
    if 'prenom' in df.columns:
        df['prenom'] = df['prenom'].fillna('').apply(lambda x: unidecode.unidecode(str(x)).strip().upper())
    else:
        df['prenom'] = ''
    return df

df_whatsapp = normalize_colonnes(df_whatsapp)
df_inscription = normalize_colonnes(df_inscription)

# 1. Par téléphone
whatsapp_in_inscription = df_whatsapp[df_whatsapp['telephone'].isin(df_inscription['telephone'])]
whatsapp_not_in_inscription = df_whatsapp[~df_whatsapp['telephone'].isin(df_inscription['telephone'])]

# 2. Par nom+prenom (pour les cas sans téléphone)
mask_nom_prenom = (
    (df_whatsapp['telephone'] == '') &
    (df_whatsapp['nom'] != '') &
    (df_whatsapp['prenom'] != '')
)
whatsapp_nomprenom = df_whatsapp[mask_nom_prenom]
insc_nomprenom = df_inscription[['nom', 'prenom']].drop_duplicates()

whatsapp_nomprenom_in_insc = whatsapp_nomprenom.merge(insc_nomprenom, on=['nom', 'prenom'], how='inner')
whatsapp_nomprenom_not_in_insc = whatsapp_nomprenom.merge(insc_nomprenom, on=['nom', 'prenom'], how='left', indicator=True)
whatsapp_nomprenom_not_in_insc = whatsapp_nomprenom_not_in_insc[whatsapp_nomprenom_not_in_insc['_merge'] == 'left_only']

# Exports
whatsapp_in_inscription.to_csv('whatsapp_deja_inscrits.csv', index=False)
whatsapp_not_in_inscription.to_csv('whatsapp_a_importer.csv', index=False)
whatsapp_nomprenom_in_insc.to_csv('whatsapp_nomprenom_deja_inscrits.csv', index=False)
whatsapp_nomprenom_not_in_insc.to_csv('whatsapp_nomprenom_a_importer.csv', index=False)

print("Comparaison terminée !")
print("- whatsapp_deja_inscrits.csv : déjà présents (par téléphone)")
print("- whatsapp_a_importer.csv : à importer (par téléphone)")
print("- whatsapp_nomprenom_deja_inscrits.csv : déjà présents (par nom+prenom, sans téléphone)")
print("- whatsapp_nomprenom_a_importer.csv : à importer (par nom+prenom, sans téléphone)") 