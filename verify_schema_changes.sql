-- Verificar que las nuevas tablas y campos se crearon correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('prescription', 'patient', 'medication_dose_log', 'medication_skip_reason_catalog')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
