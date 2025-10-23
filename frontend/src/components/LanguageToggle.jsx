import { useLanguage } from "../context/LanguageContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
    >
      {language === "ar" ? "English" : "العربية"}
    </button>
  );
}
