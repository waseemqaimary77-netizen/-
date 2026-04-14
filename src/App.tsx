/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beef, 
  Croissant, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  User,
  Zap,
  Droplets,
  Microscope,
  Dna,
  FlaskConical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MolecularView } from './components/MolecularView';
import { Food, FoodCategory, DigestionStage, StageInfo } from './types';

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
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const currentStage = STAGE_ORDER[currentStageIndex];
  const stageInfo = STAGES.find(s => s.id === currentStage);
  const transformation = selectedFood?.transformations[currentStage];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col items-center p-4 md:p-8" dir="rtl">
      {/* Header */}
      <header className="w-full max-w-4xl mb-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 bg-red-600/20 text-red-500 border border-red-500/30 px-4 py-1.5 rounded-full text-xs font-black mb-6 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
        >
          <Microscope className="w-4 h-4" />
          مختبر الكيمياء الحيوية للهضم
        </motion.div>
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter"
        >
          مختبر <span className="text-red-600">الهضم</span> الجزيئي
        </motion.h1>
        <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
          استكشف كيف تتحول الجزيئات المعقدة في طعامك إلى وحدات بناء بسيطة يمكن لجسمك امتصاصها.
        </p>
      </header>

      <main className="w-full max-w-5xl flex flex-col gap-8">
        {/* 1. اختيار العينة (Food Selection) */}
        <section>
          <Card className="border-none bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                <div className="w-3 h-8 bg-red-600 rounded-full" />
                1. اختيار العينة الغذائية
              </CardTitle>
              <CardDescription className="text-slate-400 font-bold">ابدأ باختيار نوع الجزيئات التي تريد تحليلها</CardDescription>
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
                      ? 'bg-red-600 border-red-500 shadow-xl shadow-red-900/40 text-white' 
                      : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}
                  `}
                >
                  <div className={`p-3 rounded-2xl ${selectedFood?.id === food.id ? 'bg-white/20' : 'bg-white/5'}`}>
                    {food.id === 'proteins' && <Beef className="w-6 h-6" />}
                    {food.id === 'carbs' && <Croissant className="w-6 h-6" />}
                    {food.id === 'fats' && <Droplets className="w-6 h-6" />}
                  </div>
                  <div className="text-right">
                    <div className="font-black text-lg">{food.name}</div>
                    <div className={`text-xs font-bold ${selectedFood?.id === food.id ? 'text-white/70' : 'text-slate-500'}`}>
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
              <Card className="border-none bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                    <div className="w-3 h-8 bg-red-600 rounded-full" />
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
                            ? 'bg-white/10 border-red-600 shadow-lg' 
                            : 'bg-transparent border-transparent opacity-40 hover:opacity-100'}
                        `}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${currentStageIndex === idx ? 'bg-red-600 text-white' : 'bg-white/10 text-white'}`}>
                          {idx + 1}
                        </div>
                        <div className="text-center">
                          <div className="font-black text-sm text-white">{stage.title}</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">{stage.location}</div>
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
                  <Card className="border-none bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-red-600/20 flex items-center justify-center text-red-500 shrink-0">
                          <FlaskConical className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white mb-2">3. ماذا يحدث كيميائياً؟</h3>
                          <p className="text-xl text-slate-300 leading-relaxed font-bold">
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
            <section>
              <AnimatePresence mode="wait">
                {transformation && (
                  <motion.div
                    key={`mol-${selectedFood.id}-${currentStage}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                  >
                    <div className="mb-4 flex items-center gap-3 px-4">
                      <div className="w-2 h-6 bg-red-600 rounded-full" />
                      <h3 className="text-xl font-black text-white">4. التحليل الجزيئي والتفاعل الإنزيمي</h3>
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
          <div className="min-h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
            <Dna className="w-20 h-20 text-white/10 mb-6 animate-pulse" />
            <h3 className="text-2xl font-black text-white/40">بانتظار اختيار العينة...</h3>
            <p className="text-white/20 font-bold mt-2">اختر فئة غذائية من الأعلى لبدء التحليل</p>
          </div>
        )}

        {/* Designer Credit */}
        <div className="flex items-center justify-center gap-3 p-6 bg-white/5 rounded-[2rem] border border-white/10 mt-8">
          <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">تصميم وتطوير</span>
            <span className="text-lg font-black text-white">وسيم قيمري & أكرم عواد</span>
          </div>
        </div>
      </main>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-6" onClick={() => setShowInfo(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-3xl font-black text-white mb-6">لماذا نهضم الطعام؟</h3>
              <p className="text-lg text-slate-400 font-medium leading-relaxed mb-6">
                خلايا جسمك صغيرة جداً، ولا يمكنها إدخال قطعة لحم أو خبز كاملة. الهضم هو عملية كيميائية حيوية تهدف لتفكيك "العملاقة" إلى "أقزام" (جزيئات صغيرة) تستطيع العبور من خلال الثقوب المجهرية في جدار الأمعاء لتصل إلى الدم.
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-700 py-8 rounded-3xl text-xl font-black" onClick={() => setShowInfo(false)}>
                فهمت المبدأ!
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
