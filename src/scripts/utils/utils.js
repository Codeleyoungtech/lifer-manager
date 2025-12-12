export function generateSubjectCode(subjectName) {
  if (!subjectName || typeof subjectName !== "string") {
    return "NOCD";
  }

  const upperName = subjectName.toUpperCase();

  const ignoredWords = new Set([
    "THE",
    "OF",
    "AND",
    "OR",
    "IN",
    "FOR",
    "A",
    "AN",
    "IS",
  ]);

  const words = upperName
    .replace(/[^A-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 0 && !ignoredWords.has(word));

  let code = "";

  for (let i = 0; i < Math.min(words.length, 4); i++) {
    code += words[i][0];
  }

  if (code.length < 4 && words.length > 0) {
    const firstWord = words[0];
    for (let i = code.length; i < 4 && i < firstWord.length; i++) {
      code += firstWord[i];
    }
  }

  return code.padEnd(4, "X").substring(0, 4);
}
