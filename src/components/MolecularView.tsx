import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Zap } from 'lucide-react';

interface MolecularViewProps {
  from: string;
  to: string;
  enzymes: string[];
  color: string;
}

export const MolecularView: React.FC<MolecularViewProps> = ({ from, to, enzymes, color }) => {
  return (
    <div className="w-full bg-slate-900 rounded-[2.5rem] p-8 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border-4 border-slate-800">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 relative z-10">
        {/* Molecule From */}
        <motion.div 
          key={from}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-white/20 animate-spin-slow absolute -inset-2" />
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-white font-black text-center p-2 shadow-lg"
              style={{ backgroundColor: color }}
            >
              {from}
            </div>
          </div>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">جزيء معقد</span>
        </motion.div>

        {/* Transformation Center */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <div className="flex flex-wrap justify-center gap-2">
            <AnimatePresence mode="popLayout">
              {enzymes.map((enzyme) => (
                <motion.div
                  key={enzyme}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-black flex items-center gap-2 shadow-lg shadow-red-900/40 border border-red-500"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  {enzyme}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowRight className="w-12 h-12 text-white/20" />
          </motion.div>
          
          <span className="text-red-500 text-xs font-black uppercase tracking-widest animate-pulse">تفاعل كيميائي نشط</span>
        </div>

        {/* Molecule To */}
        <motion.div 
          key={to}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white/10 absolute -inset-2" />
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-center p-2 shadow-xl border-2 border-white/20"
              style={{ backgroundColor: color, filter: 'brightness(1.2)' }}
            >
              {to}
            </div>
          </div>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">جزيء بسيط</span>
        </motion.div>
      </div>

      {/* Goal Message */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-12 p-4 bg-white/5 rounded-2xl border border-white/10 text-center max-w-md"
      >
        <p className="text-slate-300 text-sm font-medium leading-relaxed">
          الهدف: تحويل الجزيئات الكبيرة إلى جزيئات صغيرة جداً حتى تتمكن من العبور من خلال جدار الأمعاء إلى مجرى الدم.
        </p>
      </motion.div>
    </div>
  );
};
