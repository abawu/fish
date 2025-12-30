import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface AIContextType {
  chatHistory: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  addToHistory: (role: "user" | "assistant", content: string) => void;
  clearHistory: () => void;
  preferences: {
    interests: string[];
    budgetRange?: { min: number; max: number };
    location?: string;
  };
  updatePreferences: (preferences: Partial<AIContextType["preferences"]>) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [chatHistory, setChatHistory] = useState<AIContextType["chatHistory"]>([]);
  const [preferences, setPreferences] = useState<AIContextType["preferences"]>({
    interests: [],
  });

  const addToHistory = (role: "user" | "assistant", content: string) => {
    setChatHistory((prev) => [
      ...prev,
      { role, content, timestamp: new Date() },
    ]);
  };

  const clearHistory = () => {
    setChatHistory([]);
  };

  const updatePreferences = (newPreferences: Partial<AIContextType["preferences"]>) => {
    setPreferences((prev) => ({ ...prev, ...newPreferences }));
  };

  return (
    <AIContext.Provider
      value={{
        chatHistory,
        addToHistory,
        clearHistory,
        preferences,
        updatePreferences,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};
