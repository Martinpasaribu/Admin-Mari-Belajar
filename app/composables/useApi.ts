export const useApi = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  const fetchQuestions = (babId: string) => {
    return useFetch(`${apiBase}/questions`, {
      query: { babId },
      key: `questions-${babId}`
    });
  };

  return { fetchQuestions };
}