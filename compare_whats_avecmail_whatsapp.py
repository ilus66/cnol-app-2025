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

def normalize_colonnes(df):
    df['telephone'] = df['telephone'].fillna('').apply(normalize_phone)
    df['nom'] = df['nom'].fillna('').apply(lambda x: unidecode.unidecode(str(x)).strip().upper())
    df['magasin'] = df['magasin'].fillna('').apply(lambda x: unidecode.unidecode(str(x)).strip().upper())
    if 'prenom' in df.columns:
        df['prenom'] = df['prenom'].fillna('').apply(lambda x: unidecode.unidecode(str(x)).strip().upper())
    else:
        df['prenom'] = ''
    return df

# Charger les deux fichiers
# Place whats_avecmail_a_importer.csv et whatsapp_a_importer.csv à la racine du projet
df_avecmail = pd.read_csv('whats_avecmail_a_importer.csv', dtype=str)
df_whatsapp = pd.read_csv('whatsapp_a_importer.csv', dtype=str)

df_avecmail = normalize_colonnes(df_avecmail)
df_whatsapp = normalize_colonnes(df_whatsapp)

# Préparer les ensembles pour la comparaison
tuple_nom_tel = set(zip(df_whatsapp['nom'], df_whatsapp['telephone']))
tuple_nom_magasin = set(zip(df_whatsapp['nom'], df_whatsapp['magasin']))

def is_deja_dans_whatsapp(row):
    if (row['nom'], row['telephone']) in tuple_nom_tel:
        return True
    if (row['nom'], row['magasin']) in tuple_nom_magasin:
        return True
    return False

df_avecmail['deja_dans_whatsapp'] = df_avecmail.apply(is_deja_dans_whatsapp, axis=1)

deja_dans_whatsapp = df_avecmail[df_avecmail['deja_dans_whatsapp']]
a_importer_final = df_avecmail[~df_avecmail['deja_dans_whatsapp']]

# Exports
deja_dans_whatsapp.to_csv('deja_dans_whatsapp.csv', index=False)
a_importer_final.to_csv('a_importer_final.csv', index=False)

print("Comparaison terminée !")
print("- deja_dans_whatsapp.csv : présents dans les deux (nom+tel ou nom+magasin)")
print("- a_importer_final.csv : uniques à whats_avecmail_a_importer.csv") 