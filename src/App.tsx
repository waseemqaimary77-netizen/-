/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beef, 
  Croissant, 
  ChevronRight, 
  ChevronLeft,
  User,
  Droplets,
  Microscope,
  Dna,
  FlaskConical,
  BookOpen,
  GraduationCap,
  Beaker,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MolecularView } from './components/MolecularView';
import { OrganIntro } from './components/OrganIntro';
import { QuizPanel } from './components/QuizPanel';
import { Food, DigestionStage, StageInfo, AppSection } from './types';

const FOOD_CATEGORIES: Food[] = [
  {
    id: 'proteins',
    name: 'البروتينات',
    icon: 'Beef',
    color: '#991b1b',
    description: 'سلاسل معقدة من الأحماض الأمينية تحتاج لعمليات كيميائية دقيقة لتفكيكها.',
    transformations: {
      mouth: {
        from: 'بروتين معقد',
        to: 'بروتين مقطع',
        enzymes: ['اللعاب'],
        description: 'في الفم، يتم تقطيع البروتين ميكانيكياً فقط بالأسنان، ولا يوجد هضم كيميائي حقيقي للبروتين هنا.'
      },
      stomach: {
        from: 'بروتين مقطع',
        to: 'عديد ببتيد',
        enzymes: ['بيبسين', 'حمض HCl'],
        description: 'حمض المعدة ينشط إنزيم البيبسين الذي يكسر الروابط الببتيدية الكبيرة ليحول البروتين إلى سلاسل أقصر تسمى عديد الببتيد.'
      },
      small_intestine: {
        from: 'عديد ببتيد',
        to: 'أحماض أمينية',
        enzymes: ['تريبسين', 'كيموتريبسين', 'ببتيداز'],
        description: 'إنزيمات البنكرياس والأمعاء تفكك السلاسل تماماً إلى أحماض أمينية فردية جاهزة للامتصاص.'
      },
      absorption: {
        from: 'أحماض أمينية',
        to: 'مجرى الدم',
        enzymes: ['ناقلات نشطة'],
        description: 'تعبر الأحماض الأمينية جدار الأمعاء الدقيقة لتصل إلى الدم الذي ينقلها لبناء عضلاتك وأنسجتك.'
      }
    }
  },
  {
    id: 'carbs',
    name: 'النشويات',
    icon: 'Croissant',
    color: '#d97706',
    description: 'سكريات معقدة (عديدة التسكر) يجب تحويلها لسكريات أحادية بسيطة.',
    transformations: {
      mouth: {
        from: 'نشا (عديد تسكر)',
        to: 'مالتوز (سكر ثنائي)',
        enzymes: ['أميليز اللعاب'],
        description: 'يبدأ الهضم الكيميائي فوراً! الأميليز يحول سلاسل النشا الطويلة إلى سكريات ثنائية أبسط.'
      },
      stomach: {
        from: 'مالتوز',
        to: 'مالتوز',
        enzymes: ['لا يوجد'],
        description: 'يتوقف هضم النشويات في المعدة لأن الحموضة العالية تعطل عمل إنزيم الأميليز.'
      },
      small_intestine: {
        from: 'مالتوز / نشا متبقي',
        to: 'جلوكوز (سكر أحادي)',
        enzymes: ['أميليز البنكرياس', 'مالتاز', 'سكراز'],
        description: 'تتحول جميع السكريات إلى أبسط صورة ممكنة وهي الجلوكوز، ليكون جاهزاً لإنتاج الطاقة.'
      },
      absorption: {
        from: 'جلوكوز',
        to: 'طاقة للجسم',
        enzymes: ['الأنسولين'],
        description: 'يمتص الجلوكوز عبر جدار الأمعاء ويستخدمه الجسم كوقود أساسي لكل نشاطاتك.'
      }
    }
  },
  {
    id: 'fats',
    name: 'الدهون',
    icon: 'Droplets',
    color: '#eab308',
    description: 'جزيئات كبيرة لا تذوب في الماء، تحتاج لعملية "استحلاب" قبل هضمها.',
    transformations: {
      mouth: {
        from: 'كتلة دهنية',
        to: 'كتلة دهنية',
        enzymes: ['ليباز اللسان'],
        description: 'يفرز الفم كمية بسيطة من الليباز، لكن معظم الدهون تمر دون تغيير كبير.'
      },
      stomach: {
        from: 'كتلة دهنية',
        to: 'قطيرات دهنية',
        enzymes: ['ليباز المعدة'],
        description: 'تساعد حركة المعدة على تفتيت الدهون لقطرات أصغر قليلاً.'
      },
      small_intestine: {
        from: 'قطيرات دهنية',
        to: 'أحماض دهنية',
        enzymes: ['العصارة الصفراوية', 'ليباز البنكرياس'],
        description: 'الصفراء (من الكبد) تحول الدهون لمستحلب، ثم يقوم الليباز بتفكيكها لأحماض دهنية وجليسرول.'
      },
      absorption: {
        from: 'أحماض دهنية',
        to: 'الجهاز الليمفاوي',
        enzymes: ['كيلوميكرونات'],
        description: 'بسبب طبيعتها الزيتية، تمتص الدهون وتنتقل غالباً عبر الجهاز الليمفاوي قبل وصولها للدم.'
      }
    }
  }
];

const STAGES: StageInfo[] = [
  {
    id: 'mouth',
    title: 'المرحلة 1: الفم',
    location: 'التجويف الفموي',
    summary: 'بداية التفكيك الميكانيكي والكيميائي الأولي.'
  },
  {
    id: 'stomach',
    title: 'المرحلة 2: المعدة',
    location: 'الوسط الحمضي',
    summary: 'بيئة كيميائية قوية تركز على هضم البروتينات.'
  },
  {
    id: 'small_intestine',
    title: 'المرحلة 3: الأمعاء',
    location: 'الاثني عشر والأمعاء الدقيقة',
    summary: 'المحطة النهائية للتفكيك الكيميائي الشامل.'
  },
  {
    id: 'absorption',
    title: 'المرحلة 4: الامتصاص',
    location: 'الزغابات المعوية',
    summary: 'عبور المغذيات من الجهاز الهضمي إلى أنسجة الجسم.'
  }
];

const STAGE_ORDER: DigestionStage[] = ['mouth', 'stomach', 'small_intestine', 'absorption'];

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('intro');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const currentStage = STAGE_ORDER[currentStageIndex];
  const transformation = selectedFood?.transformations[currentStage];

  const renderLab = () => (
    <div className="flex flex-col gap-8">
      {/* 1. اختيار العينة (Food Selection) */}
      <section>
        <Card className="border-none bg-white rounded-[2.5rem] shadow-xl overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-3 h-8 bg-blue-600 rounded-full" />
              1. اختيار العينة الغذائية
            </CardTitle>
            <CardDescription className="text-slate-500 font-bold">ابدأ باختيار نوع الجزيئات التي تريد تحليلها</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {FOOD_CATEGORIES.map((food) => (
              <button
                key={food.id}
                onClick={() => {
                  setSelectedFood(food);
                  setCurrentStageIndex(0);
                }}
                className={`
                  flex items-center gap-4 p-5 rounded-3xl transition-all duration-300 border-2
                  ${selectedFood?.id === food.id 
                    ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-200 text-white' 
                    : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}
                `}
              >
                <div className={`p-3 rounded-2xl ${selectedFood?.id === food.id ? 'bg-white/20' : 'bg-white'}`}>
                  {food.id === 'proteins' && <Beef className="w-6 h-6" />}
                  {food.id === 'carbs' && <Croissant className="w-6 h-6" />}
                  {food.id === 'fats' && <Droplets className="w-6 h-6" />}
                </div>
                <div className="text-right">
                  <div className="font-black text-lg">{food.name}</div>
                  <div className={`text-xs font-bold ${selectedFood?.id === food.id ? 'text-white/70' : 'text-slate-400'}`}>
                    {food.description}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </section>

      {selectedFood && (
        <>
          {/* 2. مراحل التفكيك (Stages) */}
          <section>
            <Card className="border-none bg-white rounded-[2.5rem] shadow-xl">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-3 h-8 bg-blue-600 rounded-full" />
                  2. مراحل التفكيك في الجهاز الهضمي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {STAGES.map((stage, idx) => (
                    <button
                      key={stage.id}
                      onClick={() => setCurrentStageIndex(idx)}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2
                        ${currentStageIndex === idx 
                          ? 'bg-blue-50 border-blue-600 shadow-md transform scale-105' 
                          : 'bg-transparent border-transparent opacity-40 hover:opacity-100'}
                      `}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${currentStageIndex === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {idx + 1}
                      </div>
                      <div className="text-center">
                        <div className={`font-black text-sm ${currentStageIndex === idx ? 'text-blue-600' : 'text-slate-400'}`}>{stage.title}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stage.location}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 3. ماذا يحدث كيميائياً (Description) */}
          <section>
            <AnimatePresence mode="wait">
              <motion.div
                key={`desc-${selectedFood.id}-${currentStage}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-none bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-r-8 border-blue-600">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <FlaskConical className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">3. ماذا يحدث كيميائياً؟</h3>
                        <p className="text-xl text-slate-600 leading-relaxed font-bold">
                          {transformation?.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </section>

          {/* 4. الانزيمات واهدافها وكيف تحول (Molecular View) */}
          <section className="pb-12">
            <AnimatePresence mode="wait">
              {transformation && (
                <motion.div
                  key={`mol-${selectedFood.id}-${currentStage}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                >
                  <div className="mb-4 flex items-center gap-3 px-4">
                    <div className="w-2 h-6 bg-blue-600 rounded-full" />
                    <h3 className="text-xl font-black text-slate-900">4. التحليل الجزيئي والتفاعل الإنزيمي</h3>
                  </div>
                  <MolecularView 
                    from={transformation.from}
                    to={transformation.to}
                    enzymes={transformation.enzymes}
                    color={selectedFood.color}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </>
      )}

      {!selectedFood && (
          <div className="min-h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[3rem] bg-white/50">
            <Dna className="w-20 h-20 text-blue-200 mb-6 animate-pulse" />
            <h3 className="text-2xl font-black text-slate-300">بانتظار اختيار العينة...</h3>
            <p className="text-slate-200 font-bold mt-2">اختر فئة غذائية من الأعلى لبدء التحليل</p>
          </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-sky-50/50 font-sans text-slate-900 flex flex-col items-center" dir="rtl">
      {/* Modern Floating Navbar */}
      <div className="w-full fixed top-6 z-50 px-4 pointer-events-none">
        <nav className="max-w-fit mx-auto bg-white/90 backdrop-blur-xl border border-white/20 p-1.5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-1 pointer-events-auto">
           {[
            { id: 'intro', label: 'الدرس', icon: <BookOpen className="w-5 h-5" /> },
            { id: 'lab', label: 'المختبر', icon: <Beaker className="w-5 h-5" /> },
            { id: 'quiz', label: 'الاختبار', icon: <GraduationCap className="w-5 h-5" /> },
            { id: 'leaderboard', label: 'الأوائل', icon: <Trophy className="w-5 h-5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as AppSection)}
              className={`
                flex items-center gap-2 px-5 md:px-8 py-3.5 rounded-[2rem] font-black transition-all relative overflow-hidden group
                ${activeSection === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
              `}
            >
              <span className={`transition-transform duration-300 ${activeSection === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {tab.icon}
              </span>
              <span className="hidden md:inline whitespace-nowrap">{tab.label}</span>
              {activeSection === tab.id && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute inset-0 bg-blue-600 -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Header - Adjusted for fixed nav */}
      <header className="w-full max-w-5xl px-4 pt-32 pb-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-full text-xs font-black mb-6"
        >
          <Microscope className="w-4 h-4" />
          البوابة التعليمية الرقمية
        </motion.div>
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-7xl font-black text-slate-900 mb-4 tracking-tighter"
        >
          رحلة <span className="text-blue-600">الهضم</span> الذكية
        </motion.h1>
        <p className="text-slate-500 font-bold text-xl max-w-2xl mx-auto">
          استكشف، تعلم، وتحدَّ نفسك في عالم الكيمياء الحيوية للجهاز الهضمي.
        </p>
      </header>

      <main className="w-full max-w-5xl px-4 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'intro' && <OrganIntro />}
            {activeSection === 'lab' && renderLab()}
            {activeSection === 'quiz' && <QuizPanel onComplete={() => setActiveSection('leaderboard')} />}
            {activeSection === 'leaderboard' && (
               <div className="flex flex-col gap-6">
                   <Card className="border-none bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                     <QuizPanel onComplete={() => {}} showOnlyLeaderboard={true} />
                   </Card>
               </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Designer Credit */}
        <div className="flex items-center justify-center gap-4 p-8 bg-white rounded-[3rem] shadow-xl border border-slate-100 mt-12 w-full max-w-xl mx-auto">
          <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">فريق التصميم والتطوير</span>
            <span className="text-2xl font-black text-slate-900">وسيم قيمري & أكرم عواد</span>
          </div>
        </div>
      </main>
    </div>
  );
}
