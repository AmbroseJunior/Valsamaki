-- Mediterranean Diet Knowledge Graph — Seed Data
-- Based on: Lyon Diet Heart Study, PREDIMED trial, Blue Zone Crete research

-- ─── FOOD NODES ──────────────────────────────────────────────────────────────
insert into public.knowledge_nodes (label, category, description, source_citations) values
  ('olive_oil', 'food', 'Extra virgin olive oil — the cornerstone of the Cretan diet, rich in oleocanthal, polyphenols, and monounsaturated fatty acids. Crete produces some of the world''s highest-quality EVOO.', array['Lyon Diet Heart Study 1999', 'PREDIMED Trial 2013', 'Willett WC et al. 1995']),
  ('legumes', 'food', 'Chickpeas, lentils, and broad beans — staple protein sources in the Cretan diet, high in fibre and resistant starch. Consumed 3-4 times per week in traditional Cretan cuisine.', array['Keys A, Mediterranean Diet 1970', 'Messina M et al. 2014']),
  ('fish', 'food', 'Sardines, anchovies, octopus, and sea bream — rich in omega-3 fatty acids. Traditionally consumed 2-3 times per week on Crete. The Cretan coastline provides abundant fresh seafood.', array['Kris-Etherton PM 2002', 'Mozaffarian D & Rimm EB 2006']),
  ('vegetables', 'food', 'Wild greens (horta), purslane, tomatoes, aubergines — consumed daily. Purslane contains exceptionally high omega-3 for a land plant. Seasonal and foraged vegetables are central to Cretan identity.', array['Simopoulos AP et al. 1992', 'Trichopoulou A et al. 2003']),
  ('whole_grains', 'food', 'Barley rusks (dakos), wholemeal bread, and pasta. Barley was the staple grain of ancient Crete and remains important. High in beta-glucan fibre, supporting glycaemic control.', array['Liu S et al. 2003', 'de Munter JS et al. 2007']),
  ('wine', 'food', 'Moderate red wine — typically 1-2 glasses per day with meals in traditional Cretan culture. Rich in resveratrol and polyphenols. Cretan wines (Kotsifali, Mandilari) have ancient origins.', array['Renaud S & de Lorgeril M 1992', 'Estruch R et al. 2013']),
  ('herbs', 'food', 'Cretan mountain tea (Sideritis syriaca), oregano, sage, thyme, and rosemary. Used medicinally and culinarily. Mountain tea is endemic to Cretan highlands and associated with longevity.', array['Dimou S et al. 2014', 'Nissen L et al. 2009']),
  ('dairy', 'food', 'Graviera, mizithra, and strained yogurt — moderate consumption of traditional Cretan cheeses. Sheep and goat milk products with distinct probiotic profiles from traditional production.', array['Trichopoulou A 2004', 'Keys A 1970']),
  ('honey', 'food', 'Cretan thyme honey — globally recognised for its high thymol content, antimicrobial properties, and distinct flavour. Bees foraging on wild thyme above 500m produce an exceptional product.', array['Sanz ML et al. 2004', 'Bogdanov S et al. 2008'])
on conflict (label) do nothing;

-- ─── HEALTH OUTCOME NODES ────────────────────────────────────────────────────
insert into public.knowledge_nodes (label, category, description, source_citations) values
  ('cardiovascular_health', 'health_outcome', 'Reduced risk of heart attack, stroke, and coronary artery disease. The Lyon Diet Heart Study showed a 72% reduction in cardiac events for Mediterranean diet adherents.', array['Lyon Diet Heart Study 1999', 'PREDIMED 2013']),
  ('longevity', 'health_outcome', 'Crete was identified as a Blue Zone — a region with exceptional concentrations of centenarians. Traditional lifestyle including diet, physical activity, and social connection.', array['Buettner D 2005', 'Keys A 1970', 'Chrysohoou C et al. 2004']),
  ('diabetes_prevention', 'health_outcome', 'Reduced incidence of Type 2 diabetes through improved insulin sensitivity, glycaemic control from whole grains and legumes, and anti-inflammatory properties of olive oil.', array['Martinez-Gonzalez MA et al. 2008', 'Salas-Salvado J et al. 2011']),
  ('weight_management', 'health_outcome', 'Sustainable weight control without caloric restriction — the Mediterranean diet''s high satiety foods and healthy fats support long-term weight stability.', array['Shai I et al. 2008', 'Esposito K et al. 2004']),
  ('cognitive_health', 'health_outcome', 'Reduced risk of Alzheimer''s disease and cognitive decline. Olive oil polyphenols and omega-3 fatty acids support neuronal health and reduce neuroinflammation.', array['Scarmeas N et al. 2009', 'Valls-Pedret C et al. 2015']),
  ('anti_inflammatory', 'health_outcome', 'Systemic reduction in inflammatory markers (CRP, IL-6). Oleocanthal in EVOO has similar anti-inflammatory mechanism to ibuprofen.', array['Estruch R 2010', 'Beauchamp GK et al. 2005'])
on conflict (label) do nothing;

-- ─── TRADITION NODES ─────────────────────────────────────────────────────────
insert into public.knowledge_nodes (label, category, description, source_citations) values
  ('cretan_diet_study', 'tradition', 'The Seven Countries Study (Ancel Keys, 1958-1970) documented that Cretan men had the lowest cardiovascular mortality of all cohorts studied. The traditional Cretan diet became the model for "Mediterranean diet" research.', array['Keys A et al. Seven Countries Study 1980']),
  ('blue_zone_crete', 'tradition', 'Crete''s remote inland villages — particularly in the White Mountains — show exceptional longevity. Researchers attribute this to diet, daily physical activity (walking steep terrain), strong social bonds, and low stress.', array['Buettner D, Blue Zones 2012', 'Chrysohoou C 2004']),
  ('lent_fasting', 'tradition', 'Greek Orthodox fasting periods (180+ days/year) historically restricted meat and dairy. Research shows that Cretan fasting practices inadvertently produce a near-vegan diet during these periods, likely contributing to health benefits.', array['Sarri KO et al. 2004', 'Trichopoulou A et al. 2000'])
on conflict (label) do nothing;

-- ─── ACTIVITY NODES ──────────────────────────────────────────────────────────
insert into public.knowledge_nodes (label, category, description, source_citations) values
  ('physical_activity', 'activity', 'Daily physical activity — traditional Cretan life involved walking on mountainous terrain, farming, fishing, and animal husbandry. Modern Crete offers hiking trails (E4 Pan-European path), gorges (Samaria), and coastal walks.', array['Chrysohoou C et al. 2004']),
  ('hiking_crete', 'activity', 'Crete has 500km+ of marked hiking trails. The Samaria Gorge (16km), White Mountains, and Lasithi Plateau offer world-class walking. Physical activity in natural settings amplifies the health benefits of the Mediterranean lifestyle.', array['WHO Physical Activity Guidelines 2020'])
on conflict (label) do nothing;

-- ─── KNOWLEDGE EDGES ─────────────────────────────────────────────────────────
insert into public.knowledge_edges (from_node, to_node, relationship, weight) values
  ('olive_oil', 'cardiovascular_health', 'associated_with', 0.95),
  ('olive_oil', 'anti_inflammatory', 'reduces', 0.92),
  ('olive_oil', 'cognitive_health', 'supports', 0.78),
  ('olive_oil', 'longevity', 'associated_with', 0.85),
  ('legumes', 'diabetes_prevention', 'reduces_risk_of', 0.82),
  ('legumes', 'weight_management', 'supports', 0.75),
  ('legumes', 'cardiovascular_health', 'associated_with', 0.72),
  ('fish', 'cardiovascular_health', 'associated_with', 0.88),
  ('fish', 'anti_inflammatory', 'reduces', 0.80),
  ('fish', 'cognitive_health', 'supports', 0.83),
  ('vegetables', 'anti_inflammatory', 'reduces', 0.76),
  ('vegetables', 'longevity', 'associated_with', 0.70),
  ('vegetables', 'cardiovascular_health', 'associated_with', 0.68),
  ('whole_grains', 'diabetes_prevention', 'reduces_risk_of', 0.87),
  ('whole_grains', 'weight_management', 'supports', 0.72),
  ('wine', 'cardiovascular_health', 'associated_with', 0.65),
  ('wine', 'longevity', 'associated_with', 0.60),
  ('herbs', 'anti_inflammatory', 'reduces', 0.70),
  ('herbs', 'cognitive_health', 'supports', 0.65),
  ('honey', 'anti_inflammatory', 'reduces', 0.68),
  ('dairy', 'cardiovascular_health', 'associated_with', 0.55),
  ('physical_activity', 'cardiovascular_health', 'reduces_risk_of', 0.93),
  ('physical_activity', 'diabetes_prevention', 'reduces_risk_of', 0.87),
  ('physical_activity', 'weight_management', 'supports', 0.90),
  ('physical_activity', 'cognitive_health', 'supports', 0.80),
  ('hiking_crete', 'physical_activity', 'enables', 0.95),
  ('cretan_diet_study', 'olive_oil', 'documents_use_of', 0.99),
  ('cretan_diet_study', 'cardiovascular_health', 'evidences', 0.99),
  ('blue_zone_crete', 'longevity', 'evidences', 0.98),
  ('blue_zone_crete', 'physical_activity', 'involves', 0.85),
  ('lent_fasting', 'cardiovascular_health', 'associated_with', 0.70),
  ('lent_fasting', 'legumes', 'increases_consumption_of', 0.80)
on conflict do nothing;
