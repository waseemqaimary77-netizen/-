import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Info, 
  ChevronRight, 
  ChevronLeft,
  Activity,
  Heart,
  Settings,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ORGAN_DATA = [
  {
    name: "الفم",
    function: "مدخل الطعام وتقطيعه.",
    details: "يبدأ الهضم الميكانيكي بالأسنان والكيميائي باللعاب الذي يحتوي على إنزيم الأميليز لهضم النشويات.",
    color: "bg-red-50 text-red-600 border-red-100",
    icon: <Zap className="w-8 h-8" />
  },
  {
    name: "المريء",
    function: "أنبوب التوصيل.",
    details: "ينقل الطعام من البلعوم للمعدة عبر الحركة الدودية، وهي انقباضات عضلية تدفع اللقمة لأسفل.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: <Activity className="w-8 h-8" />
  },
  {
    name: "المعدة",
    function: "المصنع الحمضي.",
    details: "تمزج الطعام بالأحماض (HCl) والإنزيمات (بيبسين) لتحويله إلى سائل يسمى الكيموس، وتركز على هضم البروتين.",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    icon: <Settings className="w-8 h-8" />
  },
  {
    name: "الأمعاء الدقيقة",
    function: "الامتصاص الشامل.",
    details: "يبلغ طولها حوالي 6-7 أمتار، وفيها يكتمل الهضم الكيميائي ويمتص الدم العناصر الغذائية عبر الزغابات المعوية.",
    color: "bg-green-50 text-green-600 border-green-100",
    icon: <ShieldCheck className="w-8 h-8" />
  },
  {
    name: "الأمعاء الغليظة",
    function: "التخلص من الفضلات.",
    details: "تمتص الماء والأملاح المعدنية من البقايا الصلبة وتجهزها للخروج من الجسم كفضلات.",
    color: "bg-slate-50 text-slate-600 border-slate-100",
    icon: <Heart className="w-8 h-8" />
  },
  {
    name: "الكبد والبنكرياس",
    function: "الغدد المساعدة.",
    details: "ينتج الكبد العصارة الصفراوية لهضم الدهون، بينما يفرز البنكرياس إنزيمات قوية لهضم كل أنواع الغذاء.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    icon: <Zap className="w-8 h-8" />
  }
];

export const OrganIntro: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full flex flex-col gap-8 p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ORGAN_DATA.map((organ, idx) => (
          <button
            key={organ.name}
            onClick={() => setActiveIndex(idx)}
            className={`
              p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center text-center gap-3
              ${activeIndex === idx ? `${organ.color} ring-4 ring-offset-2 ring-transparent` : 'bg-white border-slate-100 text-slate-400 opacity-60'}
            `}
          >
            {organ.icon}
            <span className="font-black text-lg">{organ.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={ORGAN_DATA[activeIndex].name}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full"
        >
          <Card className={`border-none shadow-xl rounded-[3rem] overflow-hidden ${ORGAN_DATA[activeIndex].color.split(' ')[0]}`}>
            <CardContent className="p-8 md:p-12 relative overflow-hidden">
               <div className="absolute -right-16 -bottom-16 opacity-10">
                {React.cloneElement(ORGAN_DATA[activeIndex].icon, { className: "w-64 h-64" })}
              </div>
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-black uppercase tracking-widest opacity-60">الوظيفة الأساسية</span>
                  <h3 className="text-4xl font-black">{ORGAN_DATA[activeIndex].name}: {ORGAN_DATA[activeIndex].function}</h3>
                </div>
                <div className="h-1 w-24 bg-current opacity-20" />
                <p className="text-xl md:text-2xl font-bold leading-relaxed max-w-2xl opacity-90">
                  {ORGAN_DATA[activeIndex].details}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between px-4">
         <Button 
            variant="ghost" 
            onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
            disabled={activeIndex === 0}
            className="rounded-2xl text-slate-500 font-bold"
          >
            <ChevronRight className="ml-2 w-5 h-5" />
            السابق
          </Button>
          <div className="flex gap-2">
            {ORGAN_DATA.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'bg-blue-600 w-8' : 'bg-slate-200'}`} />
            ))}
          </div>
          <Button 
            variant="ghost" 
            onClick={() => setActiveIndex(prev => Math.min(ORGAN_DATA.length - 1, prev + 1))}
            disabled={activeIndex === ORGAN_DATA.length - 1}
            className="rounded-2xl text-slate-500 font-bold"
          >
            التالي
            <ChevronLeft className="mr-2 w-5 h-5" />
          </Button>
      </div>
    </div>
  );
};
