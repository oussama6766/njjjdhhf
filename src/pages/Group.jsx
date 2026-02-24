import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Moon, Star } from 'lucide-react'
import { addMember, memberExists } from '../lib/db'

const GROUP_INFO = {
    'SMPC': { label: 'SMPC', emoji: '⚗️', desc: 'Sciences de la Matière Physique Chimie' },
    'SMC': { label: 'SMC', emoji: '🧪', desc: 'Sciences de la Matière Chimie' },
    'GL-S6': { label: 'GL S6', emoji: '💻', desc: 'Génie Logiciel - Semestre 6' },
}

function formatPhone(raw) {
    const s = raw.trim().replace(/[^0-9+]/g, '')
    return s.startsWith('+') ? `+${s.replace(/[^0-9]/g, '')}` : `+${s.replace(/[^0-9]/g, '')}`
}
function isValidPhone(phone) {
    return /^\+212[67]\d{8}$/.test(formatPhone(phone))
}

export default function Group() {
    const { groupName } = useParams()
    const navigate = useNavigate()
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [alreadyReg, setAlreadyReg] = useState(false)
    const [error, setError] = useState('')

    const group = GROUP_INFO[groupName] || { label: groupName, emoji: '📚', desc: '' }

    useEffect(() => {
        const saved = localStorage.getItem(`registered_${groupName}`)
        if (saved) { setPhone(saved); setAlreadyReg(true) }
    }, [groupName])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!groupName || !phone.trim()) return
        if (!isValidPhone(phone)) {
            setError('الرقم خاص يكون بصيغة +2126XXXXXXX أو +2127XXXXXXX')
            return
        }
        setLoading(true); setError('')
        try {
            const formatted = formatPhone(phone)
            const exists = await memberExists(formatted, groupName)
            if (exists) {
                setAlreadyReg(true)
                localStorage.setItem(`registered_${groupName}`, formatted)
                return
            }
            await addMember(formatted, groupName)
            localStorage.setItem(`registered_${groupName}`, formatted)
            setSuccess(true)
            const msg = `السلام عليكم ، أنت رسمياً في موقع Ramadan Prep 🌙✨ نهارك مبروك!`
            window.open(`https://wa.me/${formatted.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
        } catch (err) {
            setError('حدث خطأ: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="stars-bg fixed inset-0 pointer-events-none" />
            <div className="fixed top-10 right-10 opacity-15 pointer-events-none float-animation">
                <Moon className="w-24 h-24 text-gold" />
            </div>
            <div className="fixed bottom-20 left-10 opacity-10 pointer-events-none float-animation" style={{ animationDelay: '1.5s' }}>
                <Star className="w-10 h-10 text-secondary" fill="currentColor" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

                {/* Back */}
                <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-text-secondary hover:text-gold transition-colors mb-8">
                    <ArrowRight className="w-5 h-5" />
                    <span>رجوع للرئيسية</span>
                </motion.button>

                {/* Main card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-glass rounded-3xl p-10">

                    {/* Group info */}
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-4">{group.emoji}</div>
                        <h1 className="text-3xl font-extrabold font-[Amiri] mb-2">
                            <span className="gold-gradient">{group.label}</span>
                        </h1>
                        <p className="text-text-secondary text-sm">{group.desc}</p>
                    </div>

                    {/* States */}
                    {alreadyReg ? (
                        <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                            <div className="text-5xl mb-4">✅</div>
                            <h2 className="text-xl font-bold text-success mb-2">أنت مسجّل بالفعل!</h2>
                            <p className="text-text-secondary text-sm">رقمك: <span className="dir-ltr font-bold">{phone}</span></p>
                            <p className="text-text-secondary text-sm mt-2">غادي توصلك إشعارات فالواتساب كلما نشر الأدمين جديد 📲</p>
                        </motion.div>

                    ) : success ? (
                        <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                            <div className="text-5xl mb-4">🎉</div>
                            <h2 className="text-xl font-bold text-success mb-2">تم التسجيل بنجاح!</h2>
                            <p className="text-text-secondary text-sm">غادي توصلك رسالة ترحيبية فالواتساب</p>
                        </motion.div>

                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5" key="form">
                            <div>
                                <label className="block text-gold font-bold mb-2 text-sm">📱 رقم الواتساب</label>
                                <input
                                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                    placeholder="+212612345678"
                                    dir="ltr" required
                                    className="w-full px-5 py-4 rounded-xl bg-dark-surface border border-gold\/20 text-text-primary text-center text-xl tracking-widest placeholder:text-text-secondary\/40"
                                />
                                <p className="text-text-secondary\/50 text-xs mt-2 text-right">
                                    دخل الرقم بصيغة +2126XXXXXXX أو +2127XXXXXXX
                                </p>
                            </div>

                            {error && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger text-center text-sm">
                                    {error}
                                </motion.p>
                            )}

                            <button type="submit" disabled={loading || !phone.trim()}
                                className="w-full btn-gold py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? '⏳ جاري التسجيل...' : '📲 سجّل الآن'}
                            </button>
                        </form>
                    )}
                </motion.div>

                {/* Info card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }}
                    className="card-glass rounded-2xl p-6 mt-6 text-center">
                    <p className="text-text-secondary text-sm leading-relaxed">
                        🌙 ملي تسجّل الرقم ديالك، غادي توصلك رسالة ترحيبية فالواتساب.<br />
                        وكل مرة الأدمين ينشر شي ملف (PDF, TD, Exam...) غادي يوصلك إشعار 📲
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
