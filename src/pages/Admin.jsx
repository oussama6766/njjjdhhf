import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Bell, Settings, Send, Phone, Trash2, LogOut, RefreshCw, Moon, Star, PlusCircle } from 'lucide-react'
import {
    getMembers, deleteMember, deleteAllMembers, addMembersInBulk,
    getNotifications, addNotification, getSiteUrl, saveSiteUrl
} from '../lib/db'

const GROUPS = [
    { value: 'SMPC', label: 'SMPC' },
    { value: 'SMC', label: 'SMC' },
    { value: 'GL-S6', label: 'GL S6' },
]
const GROUPS_WITH_ALL = [
    { value: 'all', label: 'الكل (جميع الأفواج) 📢' },
    ...GROUPS
]


function digits(phone) { return phone.replace(/[^0-9]/g, '') }
function formatPhone(p) { return p.startsWith('+') ? p : `+${p.replace(/[^0-9]/g, '')}` }
function isValidPhone(p) { return /^\+212[67]\d{8}$/.test(formatPhone(p)) }

export default function Admin() {
    const navigate = useNavigate()
    const [members, setMembers] = useState([])
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('members')

    // Bulk add
    const [bulkGroup, setBulkGroup] = useState('SMPC')
    const [bulkText, setBulkText] = useState('')
    const [bulkLoading, setBulkLoading] = useState(false)
    const [bulkMsg, setBulkMsg] = useState('')

    // Send
    const [sendGroup, setSendGroup] = useState('SMPC')
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [sendSuccess, setSendSuccess] = useState(false)

    // Filter
    const [filterGroup, setFilterGroup] = useState('all')

    // Settings
    const [siteUrl, setSiteUrlInput] = useState('')
    const [urlSaved, setUrlSaved] = useState(false)

    useEffect(() => {
        const adminId = localStorage.getItem('admin_id')
        if (!adminId) { navigate('/admin/login'); return }
        loadAll()
    }, [])

    async function loadAll() {
        setLoading(true)
        try {
            const [m, n, url] = await Promise.all([getMembers(), getNotifications(), getSiteUrl()])
            setMembers(m); setNotifications(n); setSiteUrlInput(url)
        } catch (err) { console.error(err) } finally { setLoading(false) }
    }

    // Stats
    const countByGroup = (g) => members.filter(m => m.group_name === g).length
    const filteredMembers = useMemo(() =>
        filterGroup === 'all' ? members : members.filter(m => m.group_name === filterGroup),
        [members, filterGroup])

    const handleDelete = async (id) => {
        if (!window.confirm('متأكد؟')) return
        await deleteMember(id)
        setMembers(prev => prev.filter(m => m.id !== id))
    }

    const handleDeleteAll = async () => {
        if (!window.confirm('غادي تمسح كلشي. واش متأكد؟')) return
        await deleteAllMembers()
        setMembers([])
    }

    const handleBulkAdd = async () => {
        setBulkLoading(true); setBulkMsg('')
        const raw = bulkText.split(/[\n,;]/).map(p => p.trim()).filter(Boolean)
        const valid = raw.filter(isValidPhone).map(formatPhone)
        try {
            const added = await addMembersInBulk(valid, bulkGroup)
            await loadAll()
            setBulkMsg(`تمت إضافة ${added.length} رقم ✅ | مرفوض ${raw.length - valid.length} ❌`)
            setBulkText('')
            setTimeout(() => setBulkMsg(''), 5000)
        } catch (err) { setBulkMsg('خطأ: ' + err.message) } finally { setBulkLoading(false) }
    }

    const handleSend = async () => {
        if (!message.trim() || sending) return
        setSending(true); setSendSuccess(false)
        try {
            const targets = sendGroup === 'all' ? members : members.filter(m => m.group_name === sendGroup)
            if (targets.length === 0) { alert('الفوج فارغ!'); return }

            await addNotification(sendGroup === 'all' ? 'الكل' : sendGroup, message.trim(), targets.length)
            await loadAll()
            setSendSuccess(true); setMessage('')

            // Multi-send via Blob HTML
            const encodedMsg = encodeURIComponent(message.trim())
            const links = targets.map((m, i) =>
                `<a href="https://wa.me/${digits(m.phone)}?text=${encodedMsg}" target="_blank">${i + 1}. ${m.phone} (${m.group_name})</a>`
            ).join('')

            const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ramadan Prep — إرسال الإشعارات</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        
        body { 
            font-family: 'Cairo', sans-serif; 
            background: linear-gradient(135deg, #0d0521, #1a0a2e); 
            color: #f5f0ff; 
            margin: 0; padding: 20px; 
            min-height: 100vh;
            display: flex; flex-direction: column; align-items: center;
        }
        .container { max-width: 800px; width: 100%; }
        .card { 
            background: rgba(26, 10, 46, 0.7); 
            backdrop-filter: blur(10px);
            border: 1px solid rgba(212, 168, 67, 0.2);
            border-radius: 24px; padding: 30px; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            margin-bottom: 25px;
        }
        .header { text-align: center; margin-bottom: 30px; }
        .gold-text { color: #fbbf24; font-weight: 900; }
        .msg-box { 
            background: #231545; padding: 20px; 
            border-radius: 15px; border-right: 5px solid #fbbf24;
            white-space: pre-line; margin-bottom: 20px; line-height: 1.6;
        }
        .stats { display: flex; justify-content: space-between; font-size: 0.9em; opacity: 0.8; margin-bottom: 20px; }
        
        .actions { 
            display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; 
        }
        .btn { 
            padding: 15px 25px; border-radius: 12px; border: none; 
            font-weight: bold; cursor: pointer; transition: all 0.3s;
            font-family: 'Cairo', sans-serif; font-size: 16px;
            display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .btn-gold { 
            background: linear-gradient(135deg, #fbbf24, #d4a843); color: #0d0521; 
            box-shadow: 0 5px 15px rgba(251, 191, 36, 0.3);
        }
        .btn-gold:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(251, 191, 36, 0.5); }
        .btn-outline { 
            background: transparent; border: 2px solid #fbbf24; color: #fbbf24; 
        }
        .btn-outline:hover { background: rgba(251, 191, 36, 0.1); }
        
        .list { display: flex; flex-direction: column; gap: 10px; }
        .item { 
            display: flex; justify-content: space-between; align-items: center;
            background: rgba(255,255,255,0.05); padding: 12px 20px; border-radius: 10px;
            text-decoration: none; color: inherit; transition: 0.2s;
        }
        .item:hover { background: rgba(255,255,255,0.1); }
        .item.done { opacity: 0.5; border-right: 3px solid #10b981; }
        .item.current { border: 2px solid #fbbf24; background: rgba(251, 191, 36, 0.15); }
        .phone { font-family: monospace; font-size: 1.1em; }
        .wa-btn { background: #22c55e; color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 12px; }

        .alert { 
            background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; 
            color: #ff9999; padding: 15px; border-radius: 12px; font-size: 14px; margin-bottom: 20px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="gold-text">إرسال الإشعارات</h1>
            <p>الفئة المستهدفة: <span class="gold-text">${sendGroup === 'all' ? 'كافة المسجلين' : sendGroup}</span></p>
        </div>

        <div class="card">
            <div class="msg-box">${message.trim()}</div>
            <div class="stats">
                <span>👥 العدد الإجمالي: ${targets.length}</span>
                <span id="progress">حالة الإرسال: في الانتظار</span>
            </div>

            <div id="popupAlert" class="alert">
                نظام الحماية في متصفحك يمنع النوافذ المنبثقة. يرجى تفعيل السماح بالنوافذ (Popups) من إعدادات المتصفح لإتمام الإرسال الجماعي بنجاح.
            </div>

            <div class="actions">
                <button id="autoBtn" class="btn btn-gold">بدء الإرسال الجماعي</button>
                <button id="nextBtn" class="btn btn-outline">إرسال تتابعي (يدوي)</button>
            </div>

            <div class="list" id="linksList">
                ${targets.map((m, i) => `
                    <a href="https://wa.me/${digits(m.phone)}?text=${encodedMsg}" 
                       target="_blank" class="item" id="item-${i}" data-index="${i}">
                        <span class="phone">${m.phone} (${m.group_name})</span>
                        <span class="wa-btn">إرسال الرسالة 💬</span>
                    </a>
                `).join('')}
            </div>
        </div>
    </div>

    <script>
        const links = ${JSON.stringify(targets.map(m => `https://wa.me/${digits(m.phone)}?text=${encodedMsg}`))};
        let currentIndex = 0;
        let isAuto = false;

        function updateProgress() {
            document.getElementById('progress').innerText = "تمت معالجة: " + currentIndex + " من أصل " + links.length;
        }

        function markDone(idx) {
            const el = document.getElementById('item-' + idx);
            if (el) {
                el.classList.remove('current');
                el.classList.add('done');
            }
        }

        function highlightNext(idx) {
            const el = document.getElementById('item-' + idx);
            if (el) el.classList.add('current');
        }

        function sendOne(idx) {
            if (idx >= links.length) {
                alert("تم إرسال كافة الإشعارات بنجاح");
                return;
            }
            
            highlightNext(idx);
            const win = window.open(links[idx], '_blank');
            
            if (!win || win.closed || typeof win.closed == 'undefined') {
                document.getElementById('popupAlert').style.display = 'block';
                isAuto = false;
                return;
            }

            markDone(idx);
            currentIndex = idx + 1;
            updateProgress();

            if (isAuto && currentIndex < links.length) {
                setTimeout(() => sendOne(currentIndex), 2000);
            }
        }

        document.getElementById('autoBtn').onclick = () => {
            isAuto = true;
            document.getElementById('popupAlert').style.display = 'none';
            sendOne(currentIndex);
        };

        document.getElementById('nextBtn').onclick = () => {
            isAuto = false;
            sendOne(currentIndex);
        };
    </script>
</body>
</html>`

            const blob = new Blob([html], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank')
            setTimeout(() => setSendSuccess(false), 5000)
        } finally { setSending(false) }
    }

    const handleSaveSettings = async () => {
        await saveSiteUrl(siteUrl)
        setUrlSaved(true); setTimeout(() => setUrlSaved(false), 3000)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="stars-bg fixed inset-0 pointer-events-none" />
            <RefreshCw className="w-12 h-12 text-gold animate-spin" />
        </div>
    )

    const tabs = [
        { id: 'members', label: 'الأعضاء', icon: <Users className="w-5 h-5" /> },
        { id: 'send', label: 'إرسال إشعار', icon: <Send className="w-5 h-5" /> },
        { id: 'history', label: 'السجل', icon: <Bell className="w-5 h-5" /> },
        { id: 'settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
    ]

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="stars-bg fixed inset-0 pointer-events-none" />
            <div className="fixed top-5 left-5 opacity-10 pointer-events-none">
                <Moon className="w-20 h-20 text-gold" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden glow-animation">
                            <img src="/images/ramadan-icon.png" alt="" className="w-full h-full object-cover"
                                onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '🌙' }} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold font-[Amiri]"><span className="gold-gradient">لوحة التحكم</span></h1>
                            <p className="text-text-secondary text-sm">Ramadan Prep Admin</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={loadAll} className="p-2 rounded-lg bg-dark-surface border border-gold/20 text-gold hover:bg-gold/10 transition-colors">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button onClick={() => { localStorage.removeItem('admin_id'); navigate('/admin/login') }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-colors text-sm font-bold">
                            <LogOut className="w-4 h-4" /> خروج
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'إجمالي الأعضاء', value: members.length, color: 'text-gold' },
                        { label: 'SMPC', value: countByGroup('SMPC'), color: 'text-violet-400' },
                        { label: 'SMC', value: countByGroup('SMC'), color: 'text-emerald-400' },
                        { label: 'GL S6', value: countByGroup('GL-S6'), color: 'text-amber-400' },
                    ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="card-glass rounded-xl p-4 text-center">
                            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                            <p className="text-text-secondary text-sm mt-1">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Nav */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${tab === t.id ? 'btn-gold' : 'card-glass text-text-secondary hover:text-gold'}`}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <AnimatePresence mode="wait">

                    {tab === 'members' && (
                        <motion.div key="m" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                            {/* Bulk Add */}
                            <div className="card-glass rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gold flex items-center gap-2"><PlusCircle className="w-5 h-5" /> إضافة بالجملة</h3>
                                        <p className="text-text-secondary text-sm mt-1">أدخل الأرقام مفصولة بأسطر أو فواصل</p>
                                    </div>
                                    <button onClick={handleDeleteAll} className="px-4 py-2 rounded-lg bg-danger/10 text-danger text-xs font-bold hover:bg-danger/20 transition-colors">
                                        مسح كلشي
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs text-text-secondary mb-2 uppercase tracking-widest">الفوج</label>
                                        <select value={bulkGroup} onChange={e => setBulkGroup(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-dark-surface border border-gold/20 text-sm">
                                            {GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs text-text-secondary mb-2 uppercase tracking-widest">الأرقام</label>
                                        <textarea value={bulkText} onChange={e => setBulkText(e.target.value)}
                                            rows={3} className="w-full p-4 rounded-xl bg-dark-surface border border-gold/20 text-sm dir-ltr"
                                            placeholder="+2126..." />
                                    </div>
                                </div>
                                {bulkMsg && <p className="mt-4 text-sm font-bold text-center text-success">{bulkMsg}</p>}
                                <button onClick={handleBulkAdd} disabled={bulkLoading || !bulkText.trim()}
                                    className="mt-4 btn-gold px-8 py-3 rounded-xl text-sm">
                                    {bulkLoading ? '⏳ جاري الحفظ...' : 'حفظ الأرقام'}
                                </button>
                            </div>

                            {/* Members List */}
                            <div className="card-glass rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-gold/10 flex justify-between items-center">
                                    <h3 className="font-bold text-gold">قائمة الأعضاء</h3>
                                    <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
                                        className="p-2 rounded-lg bg-dark-surface border border-gold/20 text-xs">
                                        <option value="all">الكل</option>
                                        {GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                    </select>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-sm">
                                        <thead className="bg-gold/5 text-gold text-xs uppercase tracking-widest">
                                            <tr>
                                                <th className="p-4">العضو</th>
                                                <th className="p-4">الفوج</th>
                                                <th className="p-4">التاريخ</th>
                                                <th className="p-4">الإجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gold/10">
                                            {filteredMembers.map(m => (
                                                <tr key={m.id} className="hover:bg-gold/5 transition-colors">
                                                    <td className="p-4 font-bold dir-ltr">{m.phone}</td>
                                                    <td className="p-4 text-text-secondary">{m.group_name}</td>
                                                    <td className="p-4 text-text-secondary text-xs">{new Date(m.created_at).toLocaleDateString('ar-MA')}</td>
                                                    <td className="p-4 flex gap-2">
                                                        <a href={`https://wa.me/${digits(m.phone)}`} target="_blank" className="p-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors">
                                                            <Phone className="w-4 h-4" />
                                                        </a>
                                                        <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredMembers.length === 0 && <p className="p-10 text-center text-text-secondary">لا يوجد أعضاء</p>}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {tab === 'send' && (
                        <motion.div key="s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
                            <div className="card-glass rounded-3xl p-8 space-y-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center text-gold glow-animation">
                                        <Send className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold font-[Amiri] text-gold">إرسال إشعار</h2>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">الفوج المستهدف</label>
                                        <select value={sendGroup} onChange={e => setSendGroup(e.target.value)}
                                            className="w-full p-4 rounded-xl bg-dark-surface border border-gold/20 text-lg">
                                            {GROUPS_WITH_ALL.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">الرسالة</label>
                                        <textarea value={message} onChange={e => setMessage(e.target.value)}
                                            rows={6} className="w-full p-4 rounded-xl bg-dark-surface border border-gold/20 text-lg leading-relaxed"
                                            placeholder="اكتب رسالتك هنا..." />
                                    </div>
                                    {sendSuccess && (
                                        <p className="bg-success/20 text-success p-4 rounded-xl text-center font-bold">تم التجهيز للإرسال ✅</p>
                                    )}
                                    <button onClick={handleSend} disabled={sending || !message.trim()}
                                        className="w-full btn-gold py-5 rounded-2xl text-xl font-bold shadow-2xl">
                                        {sending ? '⏳ جاري التجهيز...' : 'إرسال عبر الواتساب'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {tab === 'history' && (
                        <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            {notifications.map(n => (
                                <div key={n.id} className="card-glass rounded-2xl p-6 border-gold/10 hover:border-gold/30 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gold/10 p-2 rounded-lg text-gold"><Bell className="w-5 h-5" /></div>
                                            <div>
                                                <h4 className="font-bold">{n.target_group}</h4>
                                                <p className="text-xs text-text-secondary">{n.sent_count} عضو</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-text-secondary/60 font-mono" dir="ltr">{new Date(n.sent_at).toLocaleString('ar-MA')}</span>
                                    </div>
                                    <p className="text-text-secondary text-sm whitespace-pre-line leading-relaxed">{n.message}</p>
                                </div>
                            ))}
                            {notifications.length === 0 && <p className="text-center p-10 text-text-secondary">السجل فارغ</p>}
                        </motion.div>
                    )}

                    {tab === 'settings' && (
                        <motion.div key="st" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-md mx-auto">
                            <div className="card-glass rounded-3xl p-8 space-y-6">
                                <h2 className="text-xl font-bold text-gold text-center mb-6">إعدادات الموقع</h2>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-2">رابط الموقع (Vercel)</label>
                                    <input type="url" value={siteUrl} onChange={e => setSiteUrlInput(e.target.value)}
                                        placeholder="https://..." dir="ltr"
                                        className="w-full p-4 rounded-xl bg-dark-surface border border-gold/20 text-sm" />
                                </div>
                                <button onClick={handleSaveSettings} className="w-full btn-gold py-4 rounded-xl">
                                    {urlSaved ? '✅ تم الحفظ' : 'حفظ الإعدادات'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    )
}
