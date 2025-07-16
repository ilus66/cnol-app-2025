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
# Place inscription.csv et whats-avec-email.csv à la racine du projet
df_inscription = pd.read_csv('inscription.csv', dtype=str)
df_whats = pd.read_csv('whats-avec-email.csv', dtype=str)

def normalize_colonnes(df):
    df['telephone'] = df['telephone'].fillna('').apply(normalize_phone)
    df['nom'] = df['nom'].fillna('').apply(lambda x: unidecode.unidecode(str(x)).strip().upper())
    if 'prenom' in df.columns:
        df['prenom'] = df['prenom'].fillna('').apply(lambda x: unidecode.unidecode(str(x)).strip().upper())
    else:
        df['prenom'] = ''
    df['email'] = df['email'].fillna('').apply(lambda x: str(x).strip().lower())
    return df

df_inscription = normalize_colonnes(df_inscription)
df_whats = normalize_colonnes(df_whats)

# Préparer les ensembles pour la comparaison
insc_emails = set(df_inscription['email'])
insc_telephones = set(df_inscription['telephone'])
insc_noms = set(df_inscription['nom'])

def is_deja_inscrit(row):
    if row['email'] in insc_emails:
        return True
    if row['telephone'] in insc_telephones:
        return True
    if row['nom'] in insc_noms:
        return True
    return False

df_whats['deja_inscrit'] = df_whats.apply(is_deja_inscrit, axis=1)

whats_in_inscription = df_whats[df_whats['deja_inscrit']]
whats_not_in_inscription = df_whats[~df_whats['deja_inscrit']]

# Exports
whats_in_inscription.to_csv('whats_avecmail_deja_inscrits.csv', index=False)
whats_not_in_inscription.to_csv('whats_avecmail_a_importer.csv', index=False)

print("Comparaison terminée !")
print("- whats_avecmail_deja_inscrits.csv : déjà présents (par email, téléphone ou nom)")
print("- whats_avecmail_a_importer.csv : à importer (absents sur les 3 critères)") 