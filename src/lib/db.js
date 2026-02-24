import { supabase } from './supabase'

// ======== الأعضاء ========

export async function getMembers(group = null) {
    let query = supabase.from('members').select('*').order('created_at', { ascending: false })
    if (group) query = query.eq('group_name', group)
    const { data, error } = await query
    if (error) throw error
    return data || []
}

export async function addMember(phone, groupName) {
    const { data, error } = await supabase
        .from('members')
        .insert([{ phone, group_name: groupName }])
        .select()
        .single()
    if (error) throw error
    return data
}

export async function deleteMember(id) {
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) throw error
}

export async function deleteAllMembers() {
    const { error } = await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) throw error
}

export async function memberExists(phone, groupName) {
    const { data } = await supabase
        .from('members')
        .select('id')
        .eq('phone', phone)
        .eq('group_name', groupName)
        .single()
    return !!data
}

export async function addMembersInBulk(phones, groupName) {
    const rows = phones.map(phone => ({ phone, group_name: groupName }))
    const { data, error } = await supabase
        .from('members')
        .upsert(rows, { onConflict: 'phone,group_name', ignoreDuplicates: true })
        .select()
    if (error) throw error
    return data || []
}

// ======== الإشعارات ========

export async function getNotifications() {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false })
    if (error) throw error
    return data || []
}

export async function addNotification(targetGroup, message, sentCount) {
    const { data, error } = await supabase
        .from('notifications')
        .insert([{ target_group: targetGroup, message, sent_count: sentCount }])
        .select()
        .single()
    if (error) throw error
    return data
}

// ======== إعدادات الأدمين ========

export async function getSiteUrl() {
    const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'site_url')
        .single()
    return data?.value || ''
}

export async function saveSiteUrl(url) {
    const { error } = await supabase
        .from('settings')
        .upsert([{ key: 'site_url', value: url }], { onConflict: 'key' })
    if (error) throw error
}
