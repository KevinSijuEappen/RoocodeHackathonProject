-- Seed data for Community Transparency Digest

-- Sample documents
INSERT INTO documents (id, title, content, document_type, zip_code, city, state, processed) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'City Council Meeting - Housing Development Proposal', 
'The City Council reviewed a proposal for a new 200-unit affordable housing development on Main Street. The project would include 150 affordable units and 50 market-rate units. Concerns were raised about parking availability and traffic impact. The developer agreed to include 300 parking spaces and contribute $500,000 to traffic improvements. Public comment period showed mixed reactions, with housing advocates supporting the project and some residents expressing concerns about density. The proposal will be voted on at the next meeting scheduled for March 15th.', 
'meeting_notes', '94102', 'San Francisco', 'CA', true),

('550e8400-e29b-41d4-a716-446655440002', 'Transportation Budget Allocation 2024', 
'The city has allocated $12 million for transportation improvements in 2024. Key allocations include: $5M for bike lane expansion, $3M for pothole repairs, $2M for traffic signal upgrades, $1.5M for bus stop improvements, and $500K for pedestrian safety measures. The bike lane expansion will focus on connecting downtown to residential areas. Community input sessions will be held in February to prioritize specific streets for improvements.', 
'budget', '94102', 'San Francisco', 'CA', true),

('550e8400-e29b-41d4-a716-446655440003', 'Environmental Impact Assessment - Waterfront Development', 
'Environmental review of proposed waterfront commercial development reveals potential impacts on local wildlife habitat and water quality. The 50-acre development would include retail spaces, restaurants, and public parks. Mitigation measures include creating 20 acres of restored wetlands, implementing stormwater management systems, and establishing wildlife corridors. Air quality impacts are expected to be minimal with proposed green building standards. Public comment period runs through April 30th.', 
'policy', '94102', 'San Francisco', 'CA', true);

-- Sample document insights
INSERT INTO document_insights (document_id, category, summary, impact_level, key_points, action_items) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'housing', 
'New affordable housing development proposed for Main Street with 200 units total', 4,
ARRAY['150 affordable housing units planned', '300 parking spaces included', '$500K for traffic improvements', 'Vote scheduled for March 15th'],
ARRAY['Attend city council meeting on March 15th', 'Submit public comment by March 10th', 'Contact council member about parking concerns']),

('550e8400-e29b-41d4-a716-446655440002', 'transport', 
'$12M transportation budget focuses heavily on bike infrastructure and road repairs', 3,
ARRAY['$5M allocated for bike lane expansion', '$3M for pothole repairs', 'Community input sessions in February'],
ARRAY['Participate in February community input sessions', 'Submit street repair requests online', 'Advocate for specific bike lane routes']),

('550e8400-e29b-41d4-a716-446655440003', 'environment', 
'Waterfront development requires environmental mitigation including wetland restoration', 3,
ARRAY['50-acre commercial development proposed', '20 acres of wetland restoration required', 'Public comment period until April 30th'],
ARRAY['Submit environmental concerns by April 30th', 'Attend public hearings', 'Review full environmental impact report']);

-- Sample public comments with sentiment
INSERT INTO public_comments (document_id, commenter_name, comment_text, sentiment_score, sentiment_label) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'This housing development is exactly what our community needs. We desperately need more affordable housing options.', 0.8, 'positive'),
('550e8400-e29b-41d4-a716-446655440001', 'Mike Chen', 'I support affordable housing but am concerned about the traffic impact on our already congested streets.', 0.1, 'neutral'),
('550e8400-e29b-41d4-a716-446655440001', 'Lisa Rodriguez', 'This project will destroy the character of our neighborhood and create parking nightmares.', -0.7, 'negative'),
('550e8400-e29b-41d4-a716-446655440001', 'David Kim', 'Great to see the developer addressing parking concerns. This is a well-planned project.', 0.6, 'positive'),
('550e8400-e29b-41d4-a716-446655440001', 'Emma Wilson', 'We need housing but not at the expense of our quality of life. Too dense for this area.', -0.4, 'negative');

-- Sample comparative data
INSERT INTO comparative_data (city, state, zip_code, category, metric_name, metric_value, year, source) VALUES
('San Francisco', 'CA', '94102', 'housing', 'Median Home Price', 1200000, 2024, 'US Census'),
('Oakland', 'CA', '94601', 'housing', 'Median Home Price', 800000, 2024, 'US Census'),
('San Jose', 'CA', '95110', 'housing', 'Median Home Price', 1100000, 2024, 'US Census'),
('San Francisco', 'CA', '94102', 'transport', 'Public Transit Usage %', 34.2, 2024, 'DOT'),
('Oakland', 'CA', '94601', 'transport', 'Public Transit Usage %', 18.5, 2024, 'DOT'),
('San Jose', 'CA', '95110', 'transport', 'Public Transit Usage %', 12.3, 2024, 'DOT'),
('San Francisco', 'CA', '94102', 'budget', 'Per Capita Spending', 15420, 2024, 'City Budget'),
('Oakland', 'CA', '94601', 'budget', 'Per Capita Spending', 8950, 2024, 'City Budget'),
('San Jose', 'CA', '95110', 'budget', 'Per Capita Spending', 7200, 2024, 'City Budget');

-- Sample forecasts
INSERT INTO forecasts (document_id, category, prediction, confidence_score, timeframe, impact_areas) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'housing', 
'If approved, expect 15-20% increase in local foot traffic and 10% increase in property values within 0.5 miles', 
0.75, '18 months', ARRAY['property values', 'local business', 'traffic']),

('550e8400-e29b-41d4-a716-446655440002', 'transport', 
'Bike lane expansion likely to increase cycling by 25% and reduce car trips by 8% in target corridors', 
0.68, '12 months', ARRAY['traffic reduction', 'air quality', 'public health']),

('550e8400-e29b-41d4-a716-446655440003', 'environment', 
'Wetland restoration expected to improve local water quality by 30% and increase bird species diversity by 40%', 
0.82, '24 months', ARRAY['water quality', 'wildlife habitat', 'flood protection']);