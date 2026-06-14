// utils/parseAiOutput.js
// Parses the structured email output from Gemini into { subject, content }

export const parseEmailOutput = (rawText) => {
  const subjectMatch = rawText.match(/^SUBJECT:\s*(.+)/m);
  const bodyMatch    = rawText.match(/BODY:\s*([\s\S]+)/m);

  return {
    subject: subjectMatch ? subjectMatch[1].trim() : '',
    content: bodyMatch    ? bodyMatch[1].trim()    : rawText,
  };
};