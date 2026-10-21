export interface EnvVarRule {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean';
    default?: string | number | boolean;
    minLength?: number;
    oneOf?: string[];
}

export type EnvSchema = Record<string, EnvVarRule>;

export function createEnvValidator(schema: EnvSchema) {
    return (
        config: Record<string, unknown>,
    ): Record<string, unknown> => {
        const errors: string[] = [];
        const result: Record<string, unknown> = { ...config};

        for (const [key, rule] of Object.entries(schema)) {
            let raw = config[key];
            
            // Chuỗi rỗng coi như chưa đặt (Ví dụ FRONTEND_URL=)
            if (raw === '' || raw === undefined) {
               if (rule.default !== undefined){
                result[key] = rule.default;
                continue;
               }
               if(rule.required){
                errors.push(`${key}: is required but not be set`)
               }
               continue;
            }
            const value = String(raw);

            if(rule.type === 'number'){
                const n = Number(value);
                if(Number.isNaN(n)){
                    errors.push(`${key}: must be a number (current is "${value}")`);
                    continue;
                }
                result[key] = n;
            } else if(rule.type === 'boolean'){
                if (!['true', 'false'].includes(value.toLocaleLowerCase())){
                    errors.push(`${key}: must be true or false`);
                    continue;
                }
                result[key] = value.toLocaleLowerCase() === 'true';
                continue;
            }
            
            if(rule.minLength && value.length < rule.minLength){
                errors.push(`${key}: must be at least ${rule.minLength} characters long`)
            }
            if(rule.oneOf && !rule.oneOf.includes(value)){
                errors.push(`${key}: must be one of [${rule.oneOf.join(', ')}]`);
            }
        }

        if (errors.length > 0) {
            // Chỉ in tên biến, không in giá trị (tránh lộ serect vào log)
            throw new Error(`Configuration errors:\n\n${errors.join('\n - ')}`);
        }

        return result;
    };
}