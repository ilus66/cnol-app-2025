import pandas as pd
import unidecode
import glob
import os
from datetime import datetime

all_files = glob.glob('./*.csv')
dfs = []
for file in all_files:
    df = pd.read_csv(file, dtype=str, sep=';')
    # Harmonisation des noms de colonnes
    df.columns = [c.strip().lower().replace(' ', '').replace('é','e') for c in df.columns]
    # Renommage des variantes
    df = df.rename(columns={
        'nom': 'nom',
        'nom': 'nom',
        'nom': 'nom',
        'prenom': 'prenom',
        'prenom': 'prenom',
        'telephone': 'telephone',
        'telephone': 'telephone',
        'email': 'email',
        'magasin': 'magasin',
        'ville': 'ville'
    })
    # Gestion des variantes fréquentes
    if 'nom' not in df.columns and 'nom' in df.columns:
        df['nom'] = df['nom']
    if 'prenom' not in df.columns and 'prenom' in df.columns:
        df['prenom'] = df['prenom']
    if 'telephone' not in df.columns and 'telephone' in df.columns:
        df['telephone'] = df['telephone']
    if 'email' not in df.columns and 'email' in df.columns:
        df['email'] = df['email']
    if 'magasin' not in df.columns and 'magasin' in df.columns:
        df['magasin'] = df['magasin']
    if 'ville' not in df.columns and 'ville' in df.columns:
        df['ville'] = df['ville']
    df['source_file'] = os.path.basename(file)
    dfs.append(df)
df_all = pd.concat(dfs, ignore_index=True)

print("\nColonnes après concaténation :", df_all.columns.tolist())
print(df_all.head(5))

# Normalisation simple
df_all['nom'] = df_all['nom'].fillna('').apply(lambda x: unidecode.unidecode(str(x)).strip().upper())
if 'prenom' in df_all.columns:
    df_all['prenom'] = df_all['prenom'].fillna('').apply(lambda x: unidecode.unidecode(str(x)).strip().upper())
else:
    df_all['prenom'] = ''

def normalize_phone(phone):
    num = ''.join(filter(str.isdigit, str(phone)))
    if num.startswith('0'):
        num = '212' + num[1:]
    elif not num.startswith('212'):
        num = '212' + num
    return '+' + num

df_all['telephone_norm'] = df_all['telephone'].fillna('').apply(normalize_phone)

df_all['nom_complet'] = (df_all['prenom'].fillna('') + ' ' + df_all['nom'].fillna('')).str.strip()
df_all['cle_unique'] = df_all['nom_complet'] + '|' + df_all['telephone_norm']

df_all['doublon'] = df_all.duplicated('cle_unique', keep=False)

colonnes_finales = [
    'nom', 'prenom', 'telephone_norm', 'email', 'magasin', 'ville',
    'doublon', 'source_file'
]
for col in colonnes_finales:
    if col not in df_all.columns:
        df_all[col] = ''

df_uniques = df_all[~df_all['doublon']]
df_doublons = df_all[df_all['doublon']]

df_uniques[colonnes_finales].rename(columns={'telephone_norm': 'telephone'}).to_csv('import_uniques.csv', index=False)
df_doublons[colonnes_finales].rename(columns={'telephone_norm': 'telephone'}).to_csv('import_doublons.csv', index=False)

# Export uniques avec email
uniques_avecmail = df_uniques[df_uniques['email'].fillna('').str.strip() != '']
uniques_avecmail[colonnes_finales].rename(columns={'telephone_norm': 'telephone'}).to_csv('import_uniques_avecmail.csv', index=False)

# Export uniques sans email (dédoublonné par numéro de téléphone)
uniques_sansmail = df_uniques[df_uniques['email'].fillna('').str.strip() == '']
uniques_sansmail_dedup = uniques_sansmail.drop_duplicates(subset=['telephone_norm'], keep='first')
uniques_sansmail_dedup[colonnes_finales].rename(columns={'telephone_norm': 'telephone'}).to_csv('import_uniques_sansmail.csv', index=False)

print("Export terminé : import_uniques.csv (tous), import_uniques_avecmail.csv (avec email), import_uniques_sansmail.csv (sans email), import_doublons.csv (à vérifier)")