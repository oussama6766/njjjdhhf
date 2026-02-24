import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Bell, BookOpen, Moon, Star } from 'lucide-react'

const GROUPS = [
    { name: 'SMPC', label: 'SMPC', description: 'Sciences de la Matière Physique Chimie', icon: '⚗️', color: 'from-violet-600 to-purple-800' },
    { name: 'SMC', label: 'SMC', description: 'Sciences de la Matière Chimie', icon: '🧪', color: 'from-emerald-600 to-teal-800' },
    { name: 'GL-S6', label: 'GL S6', description: 'Génie Logiciel - Semestre 6', icon: '💻', color: 'from-amber-600 to-orange-800' },
]

const features = [
    { icon: <Users className="w-6 h-6" />, title: 'سجّل رقمك', desc: 'اختر الفوج ديالك وسجّل' },
    { icon: <Bell className="w-6 h-6" />, title: 'توصل بالإشعارات', desc: 'كل جديد يوصلك فالواتساب' },
    { icon: <BookOpen className="w-6 h-6" />, title: 'ملفات ومراجعات', desc: 'PDF, TD, Exams, Fiches' },
]

export default function Home() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="stars-bg fixed inset-0 pointer-events-none" />

            {/* Floating decorations */}
            <div className="fixed top-10 left-10 opacity-20 pointer-events-none">
                <Moon className="w-32 h-32 text-gold" />
            </div>
            <div className="fixed top-20 right-20 opacity-15 pointer-events-none float-animation">
                <Star className="w-16 h-16 text-secondary" fill="currentColor" />
            </div>
            <div className="fixed bottom-20 left-20 opacity-10 pointer-events-none float-animation" style={{ animationDelay: '1s' }}>
                <Star className="w-12 h-12 text-gold" fill="currentColor" />
            </div>

            {/* Header */}
            <header className="relative z-10 pt-8 pb-4 px-4">
                <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }} className="text-center">
                    <div className="mx-auto mb-6 w-28 h-28 rounded-full overflow-hidden glow-animation">
                        <img src="/images/ramadan-icon.png" alt="Ramadan" className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="font-size:3rem;display:flex;align-items:center;justify-content:center;height:100%">🌙</span>' }} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-[Amiri] mb-2">
                        <span className="gold-gradient">Ramadan Prep</span>
                    </h1>
                    <div className="w-40 h-1 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent my-4" />
                    <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        ✨ منصة رمضانية للتحضير والمراجعة ✨<br />
                        <span className="text-secondary-light">سجّل رقمك وتوصل بكل جديد عبر الواتساب</span>
                    </p>
                </motion.div>
            </header>

            {/* Feature cards */}
            <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .6, delay: .3 }}
                className="relative z-10 max-w-5xl mx-auto px-4 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((f, i) => (
                        <div key={i} className="card-glass rounded-xl p-5 text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gold\/10 flex items-center justify-center text-gold">
                                {f.icon}
                            </div>
                            <h3 className="text-gold font-bold text-lg mb-1">{f.title}</h3>
                            <p className="text-text-secondary text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Banner */}
            <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .6, delay: .4 }}
                className="relative z-10 max-w-5xl mx-auto px-4 mb-12">
                <div className="rounded-2xl overflow-hidden border border-gold/20 shadow-2xl">
                    <img src="/images/ramadan-banner.png" alt="Ramadan Banner"
                        className="w-full h-48 md:h-64 object-cover"
                        onError={e => { e.target.style.display = 'none' }} />
                </div>
            </motion.div>

            {/* Groups */}
            <section className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
                <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .7 }}
                    className="text-3xl md:text-4xl font-bold text-center mb-2 font-[Amiri]">
                    <span className="gold-gradient">☪ اختر الفوج ديالك ☪</span>
                </motion.h2>
                <p className="text-text-secondary text-center mb-10">سجّل رقم الواتساب ديالك وتوصل بكل جديد</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {GROUPS.map((g, i) => (
                        <motion.div key={g.name}
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: .5, delay: .8 + i * .15 }}
                            whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: .98 }}
                            onClick={() => navigate(`/group/${g.name}`)}
                            className="cursor-pointer">
                            <div className="card-glass rounded-2xl p-8 text-center hover:border-gold\/40 transition-all duration-300">
                                <div className="text-5xl mb-4">{g.icon}</div>
                                <div className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${g.color} mb-4`}>
                                    <h3 className="text-2xl font-extrabold text-white">{g.label}</h3>
                                </div>
                                <p className="text-text-secondary text-sm mb-4">{g.description}</p>
                                <div className="btn-gold px-6 py-3 rounded-xl text-sm font-bold inline-block">
                                    📲 سجّل الآن
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-gold\/10 py-6 text-center">
                <p className="text-text-secondary text-sm">🌙 Ramadan Prep © 2025 — رمضان مبارك</p>
                <button onClick={() => navigate('/admin/login')}
                    className="mt-2 block text-text-secondary\/40 text-xs hover:text-gold transition-colors mx-auto">
                    لوحة التحكم
                </button>
            </footer>
        </div>
    )
}
