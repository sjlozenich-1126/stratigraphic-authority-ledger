async function mintEntry(formData) {
  const res = await fetch("/api/mint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document_name: formData.documentName,
      raw_content: formData.rawContent,
      action_token: formData.actionToken,
      stratum: formData.stratum,
      case_number: formData.caseNumber,
      narrative_link: formData.narrativeLink,
    }),
  });

  const data = await res.json();
  console.log("Minted entry:", data);
  return data;
}
