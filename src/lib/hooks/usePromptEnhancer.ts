const usePromptEnhancer = () => {
  const enhancePrompt = async (userInput: string): Promise<string> => {
    if (!userInput.trim()) return userInput;

    try {
      // Use analyse route which has OpenRouter fallback
      const apiUrl = '/api/ai/analyse';

      const systemPrompt = `SYSTEM: You are a prompt enhancer for a fitness AI app. Your job is to take the user's natural language input and convert it into a concise, structured prompt that follows these EXACT examples:

EXAMPLES:
- "Gain 5kg muscle in 30 days, no dairy"
- "Lose 3kg in 2 weeks, vegan"
- "Marathon training plan, intermediate"
- "Busy mom, 20min workouts, 2 kids"

RULES:
1. Extract ALL key information from user's request (goal, time frame, dietary restrictions, lifestyle constraints, fitness level, workout preferences, etc.)
2. Make it concise and structured, like the examples
3. Do NOT make up information that the user didn't mention
4. Keep it natural and easy to understand
5. If the user's request is already concise and structured, return it as is
6. If the user types a very general request (like "I want to get fit" or "Help me workout"), add general instructions to make it specific

USER'S INPUT: ${userInput}

Return ONLY the enhanced prompt, no extra text or explanations.`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: systemPrompt }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error('Prompt Enhancer API Error:', res.status, errorData);
        throw new Error('Failed to enhance prompt');
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Clean up the response
      let enhanced = data.answer.trim();
      // Remove any quotes if present
      enhanced = enhanced.replace(/^["']|["']$/g, '');
      return enhanced;
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      // Fallback to original input if API fails
      return userInput;
    }
  };

  return { enhancePrompt };
};

export default usePromptEnhancer;
