import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Moon, Star } from 'lucide-react'

const ADMIN_CODE = '123'

export default function AdminLogin() {
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setError('')
        try {
            if (code.trim() !== ADMIN_CODE) {
                setError('الكود غير صحيح')
                return
            }
            localStorage.setItem('admin_id', Date.now().toString())
            navigate('/admin')
        } catch {
            setError('حدث خطأ، حاول مرة أخرى')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
            <div className="stars-bg fixed inset-0 pointer-events-none" />

            {/* Decos */}
            <div className="fixed top-10 right-10 opacity-15 pointer-events-none float-animation">
                <Moon className="w-24 h-24 text-gold" />
            </div>
            <div className="fixed bottom-20 left-10 opacity-10 pointer-events-none float-animation" style={{ animationDelay: '1s' }}>
                <Star className="w-12 h-12 text-secondary" fill="currentColor" />
            </div>

            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md mx-4">

                <div className="card-glass rounded-3xl p-10 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center glow-animation">
                        <Lock className="w-10 h-10 text-gold" />
                    </div>

                    <h1 className="text-3xl font-extrabold mb-2">
                        <span className="gold-gradient font-[Amiri]">لوحة التحكم</span>
                    </h1>
                    <p className="text-text-secondary mb-8">أدخل كود الأدمين للدخول</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <input
                            type="password" value={code} onChange={e => setCode(e.target.value)}
                            placeholder="كود الأدمين" required
                            className="w-full px-5 py-4 rounded-xl bg-dark-surface border border-gold/20 text-text-primary text-center text-xl tracking-widest placeholder:text-text-secondary/40"
                        />

                        {error && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger text-sm">
                                {error}
                            </motion.p>
                        )}

                        <button type="submit" disabled={loading || !code}
                            className="w-full btn-gold py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? '⏳ جاري التحقق...' : '🔓 دخول'}
                        </button>
                    </form>

                    <button onClick={() => navigate('/')}
                        className="mt-6 text-text-secondary/50 text-sm hover:text-gold transition-colors">
                        ← رجوع للرئيسية
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
