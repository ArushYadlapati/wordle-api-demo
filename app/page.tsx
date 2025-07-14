"use client";

import { useState } from "react";

const API_URL = "https://slack-wordle-api.vercel.app/api";

type Wordle = {
    solution: string;
    date: string;
    day: number;
};

export default function Home() {
    const [word, setWord] = useState("");
    const [checkResult, setCheckResult] = useState<null | {
        guess: string;
        correct: boolean;
        result: number[];
    }>(null);

    const [isValid, setIsValid] = useState<null | boolean>(null);
    const [wordleData, setWordleData] = useState<null | Wordle>(null);
    const [showWord, setShowWord] = useState(false);

    const [futureWords, setFutureWords] = useState<Wordle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showFutureWords, setNextWords] = useState(false);

    const toggleWordOfDay = async () => {
        if (showWord) {
            setShowWord(false);
        } else {
            if (!wordleData) {
                const res = await fetch(`${API_URL}/wordle`);
                const data = await res.json();
                setWordleData(data);
            }
            setShowWord(true);
        }
    };

    const nextWords = async () => {
        if (showFutureWords) {
            setNextWords(false);
        } else {
            if (futureWords.length === 0) {
                await getFutureWords();
            }
            setNextWords(true);
        }
    };

    const validateWord = async () => {
        const res = await fetch(`${API_URL}/game/valid?word=${word}`);
        const data = await res.json();
        setIsValid(data.valid);
        return data.valid;
    };

    const checkWord = async () => {
        const valid = await validateWord();
        if (valid) {
            const res = await fetch(`${API_URL}/game/check?word=${word}`);
            const data = await res.json();
            setCheckResult(data);
        } else {
            setCheckResult(null);
        }
    };

    const getFutureWords = async () => {
        setIsLoading(true);
        const today = new Date();
        const results: Wordle[] = [];
        let dayOffset = 0;

        while (true) {
            const date = new Date(today);
            date.setDate(today.getDate() + dayOffset);
            const formatted = date.toISOString().split("T")[0];

            try {
                const res = await fetch(`${API_URL}/wordle?timestamp=${formatted}`);

                if (!res.ok) {
                    break;
                }

                const data = await res.json();
                results.push({ ...data, date: formatted, solution: data.solution, day: data.day });
                dayOffset++;
            } catch (err) {
                break;
            }
        }

        setFutureWords(results);
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">
                Slack Wordle API Demo
            </h1>
            <p className="mb-6">
                This website is a demo for the custom API that I made to fetch Wordle data and validate words.
                You can check today's Wordle, validate your own words, and see (some) future Wordle solutions.

                <br/>
                API JSON: {" "}
                <a href="https://slack-wordle-api.vercel.app/api" target="_blank" rel="noopener noreferrer"
                   className={"underline text-blue-500 hover:text-blue-700"}
                >
                    https://slack-wordle-api.vercel.app/api
                </a>

                <br/>
                API GitHub: {" "}
                <a href="https://github.com/ArushYadlapati/slack-wordle-api" target="_blank" rel="noopener noreferrer"
                   className={"underline text-blue-500 hover:text-blue-700"}
                >
                    https://github.com/ArushYadlapati/slack-wordle-api
                </a>

                <br/>
                Demo (this) GitHub: {" "}
                <a href="https://github.com/ArushYadlapati/wordle-api-demo" target="_blank" rel="noopener noreferrer"
                   className={"underline text-blue-500 hover:text-blue-700"}
                >
                    https://github.com/ArushYadlapati/wordle-api-demo
                </a>
            </p>

            <section className="mb-6">
                <button onClick={toggleWordOfDay} className="text-black border-2 px-4 py-2 rounded">
                    {showWord ? "Hide Word Info" : "Get Today's Word Info"}
                </button>

                <button onClick={nextWords} disabled={isLoading}
                        className="text-black border-2 px-4 py-2 rounded ml-4"
                >
                    {isLoading
                        ? "Loading..."
                        : showFutureWords
                            ? "Hide Future Word Info"
                            : "Get Future Word Info"}
                </button>

                {showWord && wordleData && (
                    <div className="mt-4 p-4 border rounded bg-gray-50">
                        <p>
                            <strong>Date:</strong> {wordleData.date}
                        </p>
                        <p>
                            <strong>Solution:</strong> {wordleData.solution}
                        </p>
                        <p>
                            <strong>Day #:</strong> {wordleData.day}
                        </p>
                    </div>
                )}

                {showFutureWords && futureWords.length > 0 && (
                    <div className="mt-6 p-4 border rounded bg-gray-50 max-h-[400px] overflow-y-auto">
                        <h2 className="font-bold mb-2">Future Words</h2>
                        <ul className="space-y-2 text-sm">
                            {futureWords.map((word, idx) => (
                                <li key={idx} className="border-b pb-2">
                                    <p>
                                        <strong> Date: </strong>
                                        {word.date}
                                    </p>
                                    <p>
                                        <strong> Solution: </strong>
                                        {word.solution}
                                    </p>
                                    <p>
                                        <strong> Day #: </strong>
                                        {word.day}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            <section className="mb-6">
                <label className="block mb-2 font-semibold">
                    Enter a 5-letter Word:
                </label>
                <input value={word} onChange={(e) => setWord(e.target.value)}
                    className="border rounded px-3 py-2 w-full" placeholder="e.g. slate (my personal Wordle starter)"
                />
                <div className="flex gap-4 mt-4">
                    <button onClick={validateWord} className="text-black border-2 px-4 py-2 rounded">
                        Validate Word
                    </button>
                    <button onClick={checkWord} className="text-black border-2 px-4 py-2 rounded">
                        Check Against Word of Day
                    </button>
                </div>

                {isValid !== null && (
                    <p className="mt-2">
                        Word is Valid:
                        <strong>
                            {isValid ? "Yes" : "No"}
                        </strong>
                    </p>
                )}

                {checkResult && checkResult.result && (
                    <div className="mt-4 p-4 border rounded bg-gray-50">
                        <p>
                            <strong>
                                Guess:
                            </strong>
                            {checkResult.guess}
                        </p>
                        <p>
                            <strong>
                                Correct:
                            </strong>
                            {checkResult.correct ? "Yes" : "No"}
                        </p>
                        <p>
                            <strong>
                                Result:
                            </strong>
                            {checkResult.result.join(", ")}
                        </p>
                        <p className="text-sm text-gray-500">
                            0 = letter os in correct position, 1 = letter is in word but is wrong position, 2 = letter is not in word
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}
