import { useEffect, useState } from "react";
import { getKoreanToday, watchKoreanToday } from "@/lib/startupPostStatus";

export function useKoreanToday(): string {
  const [today, setToday] = useState(getKoreanToday);

  useEffect(() => watchKoreanToday(setToday), []);

  return today;
}