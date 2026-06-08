import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from "../../redux/store"; // Adjust the path to your Redux store
import { useAppSelector } from './hooks';

interface Topic {
    title: string;
}

interface Chapter {
    title: string;
}

interface Lesson {
    title: string;
}

interface TitleItem {
    topic: string;
    chapter: string;
    lesson: string;
    lessonId: string;
}

interface GPTResponse {
    answer: string;
    error?: string;
}

interface FormattedResponse {
    answer: string | null;
    error: string | null;
}

const isProduction = process.env.NODE_ENV === 'production';
const CORS_PROXY = isProduction ? '' : process.env.NEXT_PUBLIC_CORS_PROXY;
const API_URL = `${CORS_PROXY}${process.env.NEXT_PUBLIC_SHEMOOLE}`;

// Helper function to remove unwanted characters
const filterResponse = (response: string): string => {
    return response.replace(/```json|```|\\n/g, '').trim();
};

// Helper function to safely parse JSON
const safelyParseJSON = (jsonString: string) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Failed to parse JSON response:', error);
        return null;
    }
};

// Hook to collect TitlesReference
const useTitlesReference = (userQuestion: string, reqID: string) => {
    const { token, isLoggedIn } = useAppSelector((state) => state.auth);
    const [resetState, setResetState] = useState(false);
    const [progress, setProgress] = useState<number>(0);
    const [titlesReference, setTitlesReference] = useState<TitleItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [titlesLoading, setTitlesLoading] = useState<boolean>(false);

    const PL = useSelector((state: RootState) => state.prompts);

    useEffect(() => {
        if (PL.list.length === 0) {
            console.log('Prompts list is empty. Waiting for prompts to load...');
            return;
        }
        console.log('@PL_useTitlesReference:', PL);
    }, [PL]);

    // API URL
    const apiUrl = `${API_URL}/ask-moole`;

    // Fetch GPT response
    const askGPT = async (question: string): Promise<FormattedResponse> => {
        try {
            setTitlesLoading(true);

            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });

            if (!res.ok) throw new Error("Failed to get response from GPT");

            const data: GPTResponse = await res.json();
            setTitlesLoading(false);
            return { answer: data.answer, error: null };

        } catch (err: unknown) {
            setTitlesLoading(false);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            return { answer: null, error: errorMessage };
        }
    };

    useEffect(() => {
        if (resetState) {
            setProgress(0);
            setTitlesReference([]);
            setError(null);
            setResetState(false);
        }
    }, [resetState]);

    // Fetch Topics
    useEffect(() => {
        if (progress >= 1 || resetState) return;

        const fetchTitles = async () => {
            const promptTemplate = process.env.NEXT_PUBLIC_PROMPT_MAIN_TOPICS || "";
            const prompt = promptTemplate.replace("{userQuestion}", userQuestion);

            const { answer, error } = await askGPT(prompt);
            if (error) {
                setError(error);
                return;
            }

            const filteredResponse = filterResponse(answer || "");
            const parsedTopics = safelyParseJSON(filteredResponse);

            if (!parsedTopics) return;

            const chaptersResults = await Promise.all(
                parsedTopics.map(async (topic: Topic) => {
                    const chapterPromptTemplate = process.env.NEXT_PUBLIC_PROMPT_CHAPTERS || "";
                    const chapterPrompt = chapterPromptTemplate.replace("{topic.title}", topic.title);

                    const chapterResponse = await askGPT(chapterPrompt);
                    if (chapterResponse.error) {
                        setError(chapterResponse.error);
                        return [];
                    }

                    const filteredChapterResponse = filterResponse(chapterResponse.answer || "");
                    const parsedChapters = safelyParseJSON(filteredChapterResponse);

                    if (!parsedChapters) return [];

                    const lessonResults = await Promise.all(
                        parsedChapters.map(async (chapter: Chapter) => {
                            const lessonPromptTemplate = process.env.NEXT_PUBLIC_PROMPT_LESSONS || "";
                            const lessonPrompt = lessonPromptTemplate.replace("{chapter.title}", chapter.title);

                            const lessonResponse = await askGPT(lessonPrompt);
                            if (lessonResponse.error) {
                                setError(lessonResponse.error);
                                return [];
                            }

                            const filteredLessonResponse = filterResponse(lessonResponse.answer || "");
                            const parsedLessons = safelyParseJSON(filteredLessonResponse);

                            return parsedLessons
                                ? parsedLessons.map((lesson: Lesson) => ({
                                    lessonId: crypto.randomUUID(),
                                    topic: topic.title,
                                    chapter: chapter.title,
                                    lesson: lesson.title,
                                }))
                                : [];
                        })
                    );
                    return lessonResults.flat();
                })
            );

            setTitlesReference(chaptersResults.flat());
            setProgress(1);
        };

        if (userQuestion) fetchTitles();
    }, [userQuestion, progress]);

    return { titlesReference, error, titlesLoading, setResetState };
};

export default useTitlesReference;
