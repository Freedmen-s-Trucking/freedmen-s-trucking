import {openAiClient} from "./config";
import {ExtractedDriverInsuranceDetailsSchema} from "@freedmen-s-trucking/types";

export const parseRawTextExtractedFromDriverInsurance = async (text: string) => {
  const response = await openAiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {role: "developer", content: driverLicenseDetailsExtractionSystemPrompt},
      {role: "user", content: text},
    ],
    temperature: 0.2,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "DriverLicenseDetails",
        description: "Driver license details",
        // strict: true,
        schema: ExtractedDriverInsuranceDetailsSchema as Record<string, unknown>,
      },
    },
  });
  return response.choices[0].message.content;
};

const driverLicenseDetailsExtractionSystemPrompt = `
Extract the following fields from this insurance card OCR text. Return ONLY JSON with these keys (use "" for missing fields):  
${JSON.stringify(ExtractedDriverInsuranceDetailsSchema)}

### Rules:  
1. **Name**: Capitalize properly (e.g., "Kwasi Sinnette").  
2. **Dates**: Normalize to MM/DD/YYYY (e.g., "09/27/24" → "09/27/2024").  
3. **VIN**: 17-character alphanumeric, uppercase.  
4. **NAIC**: 5-digit number.  
5. **Address**: Format as "STREET, CITY, STATE, ZIP".  
`;
