import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  User,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizQuestion, LeaderboardEntry } from '../types';
import { QUIZ_POOL } from '../data/quizQuestions';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export const QuizPanel: React.FC<{ 
  onComplete: () => void;
  showOnlyLeaderboard?: boolean;
}> = ({ onComplete, showOnlyLeaderboard = false }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [quizState, setQuizState] = useState<'start' | 'playing' | 'submitting' | 'result'>(showOnlyLeaderboard ? 'result' : 'start');
  const [userName, setUserName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    setSubmitError("حدث خطأ أثناء حفظ النتيجة. يرجى المحاولة مرة أخرى.");
  };

  useEffect(() => {
    if (quizState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setQuizState('result');
    }
  }, [quizState, timeLeft]);

  const startQuiz = () => {
    // Shuffle and pick 5
    const shuffled = [...QUIZ_POOL].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
    setQuizState('playing');
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(120);
    setIsAnswered(false);
    setSelectedOption(null);
    setIsSubmitted(false);
    setSubmitError(null);
    startTimeRef.current = Date.now();
  };

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    if (optionIndex === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }

    setTimeout(async () => {
      if (currentIndex < 4) {
        setCurrentIndex(c => c + 1);
        setIsAnswered(false);
        setSelectedOption(null);
      } else {
        // Prepare final data
        const isLastCorrect = optionIndex === questions[currentIndex].correctAnswer;
        const finalScore = score + (isLastCorrect ? 1 : 0);
        const finalTimeMs = Date.now() - startTimeRef.current;
        const finalTimeSec = finalTimeMs / 1000;

        // Transition to result IMMEDIATELY for speed
        setScore(finalScore);
        setQuizState('result');
        
        // Background submission without blocking the UI
        const path = 'leaderboard';
        try {
          await addDoc(collection(db, path), {
            name: userName,
            score: finalScore,
            time: finalTimeSec,
            createdAt: serverTimestamp()
          });
          setIsSubmitted(true);
          await fetchLeaderboard();
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, path);
        }
      }
    }, 1500);
  };

  const fetchLeaderboard = async () => {
    try {
      // Query only by score to avoid index requirement for composite sorting
      const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LeaderboardEntry[];
      
      // Secondary sort by time (ascending) in JS
      const sorted = data.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time - b.time;
      }).slice(0, 10);

      setLeaderboard(sorted);
    } catch (e) {
      console.error("Leaderboard fetch error:", e);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (quizState === 'start') {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-6 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
          <Trophy className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 leading-tight">تحدى معلوماتك في الهضم!</h2>
        <p className="text-slate-600 max-w-sm">اختبار من 5 أسئلة عشوائية لقياس مدى فهمك للعمليات الحيوية. هل تستطيع الوصول للمراكز الأولى؟</p>
        <div className="w-full max-w-xs space-y-4">
          <input 
            type="text" 
            placeholder="أدخل اسمك للانضمام.." 
            className="w-full px-6 py-4 rounded-3xl border-2 border-slate-200 bg-white focus:border-blue-500 outline-none font-bold text-center"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Button 
            className="w-full h-16 rounded-3xl text-xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200"
            onClick={startQuiz}
            disabled={!userName.trim()}
          >
            ابدأ الاختبار الآن
          </Button>
        </div>
      </div>
    );
  }

  if (quizState === 'playing') {
    const q = questions[currentIndex];
    return (
      <div className="p-2 md:p-8">
        <div className="flex items-center justify-between mb-8 overflow-hidden rounded-2xl bg-slate-100 p-4">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-400">السؤال {currentIndex + 1} / 5</span>
            <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${(currentIndex / 5) * 100}%` }} />
            </div>
          </div>
          <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft < 20 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
            <Timer className="w-5 h-5" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-8 text-center">{q.question}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((opt, i) => (
            <button
              key={i}
              disabled={isAnswered}
              onClick={() => handleAnswer(i)}
              className={`
                p-6 rounded-[2rem] border-2 transition-all flex items-center justify-center text-lg font-bold text-center
                ${selectedOption === i ? 'scale-95' : 'hover:border-slate-300'}
                ${isAnswered && i === q.correctAnswer ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-slate-100'}
                ${isAnswered && selectedOption === i && i !== q.correctAnswer ? 'bg-red-100 border-red-500 text-red-700' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {isAnswered && i === q.correctAnswer && <CheckCircle2 className="w-5 h-5" />}
                {isAnswered && selectedOption === i && i !== q.correctAnswer && <XCircle className="w-5 h-5" />}
                {opt}
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 text-center"
            >
              <p className="text-slate-600 font-bold">{q.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 flex flex-col items-center gap-6">
      {!showOnlyLeaderboard && (
        <>
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-slate-900">انتهى الاختبار!</h2>
            <p className="text-xl font-bold text-slate-400">نتيجتك النهائية</p>
          </div>

          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-blue-600"
                strokeDasharray={502.4} strokeDashoffset={502.4 - (score / 5) * 502.4} strokeLinecap="round" />
            </svg>
            <span className="absolute text-5xl font-black text-slate-900">{score}<span className="text-2xl text-slate-400">/5</span></span>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-md:max-w-xs md:max-w-md">
            <div className="bg-slate-50 p-4 rounded-3xl text-center">
              <div className="text-xs font-black text-slate-400 uppercase mb-1">الوقت المستغرق</div>
              <div className="text-2xl font-black text-slate-800">{(Date.now() - startTimeRef.current) / 1000} ث</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl text-center">
              <div className="text-xs font-black text-slate-400 uppercase mb-1">نسبة النجاح</div>
              <div className="text-2xl font-black text-slate-800">{score * 20}%</div>
            </div>
          </div>

      <div className="flex flex-col w-full max-w-xs gap-3">
        {quizState === 'result' && !showOnlyLeaderboard && (
          isSubmitted ? (
            <div className="h-16 rounded-3xl bg-green-50 text-green-600 flex items-center justify-center font-black gap-2 border-2 border-green-100">
              <CheckCircle2 className="w-6 h-6" />
              تم حفظ نتيجتك في القائمة!
            </div>
          ) : submitError ? (
            <div className="h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center font-black gap-2 border-2 border-red-100 p-2 text-center text-sm">
              <XCircle className="w-5 h-5 shrink-0" />
              {submitError}
            </div>
          ) : (
            <div className="h-16 rounded-3xl bg-blue-50 text-blue-500 flex items-center justify-center font-black gap-3 border-2 border-blue-100">
              <Loader2 className="w-6 h-6 animate-spin" />
              جاري حفظ النتيجة في القائمة..
            </div>
          )
        )}
        <Button 
          variant="outline"
          className="h-16 rounded-3xl text-xl font-black border-2 border-slate-200"
          onClick={startQuiz}
        >
          <RotateCcw className="ml-2 w-5 h-5" />
          إعادة الاختبار
        </Button>
      </div>
        </>
      )}

      <div className="w-full mt-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-amber-500" />
            قائمة الأوائل
          </h3>
          {showOnlyLeaderboard && (
             <Button 
              className="rounded-3xl font-black bg-blue-600 h-12 px-8"
              onClick={startQuiz}
            >
              ابدأ الاختبار الآن
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {leaderboard.length === 0 ? (
             <div className="p-12 text-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
              لا يوجد متصدرون بعد.. كن الأول!
            </div>
          ) : (
            leaderboard.map((entry, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={entry.id} 
                className={`flex items-center justify-between p-5 rounded-[1.5rem] shadow-sm border ${i === 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}
              >
                <div className="flex items-center gap-5">
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                    i === 0 ? 'bg-amber-400 text-white shadow-lg' : 
                    i === 1 ? 'bg-slate-300 text-white' :
                    i === 2 ? 'bg-orange-300 text-white' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-black text-slate-800 text-lg block truncate">{entry.name}</span>
                    <span className="text-xs font-bold text-slate-400">طالب نشط</span>
                  </div>
                </div>
                <div className="flex gap-4 md:gap-8 items-center text-left shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="text-blue-600 font-black text-xl md:text-2xl">{entry.score}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">الأسئلة</span>
                  </div>
                  <div className="flex flex-col items-center min-w-[60px]">
                    <span className="text-slate-800 font-black text-xl md:text-2xl">
                      {typeof entry.time === 'number' ? entry.time.toFixed(2) : entry.time}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">ثواني</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

