
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bkjsgvoxgvpeqrmdvgim.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJranNndm94Z3ZwZXFybWR2Z2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTc4ODYsImV4cCI6MjA4MTgzMzg4Nn0.qVMH0Dt2g7SHS4opJqwi9oxzxfjqhVL1plbJYPlWNOs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testConnection() {
    console.log('Testing connection to:', SUPABASE_URL)
    const start = Date.now()

    try {
        const query = supabase
            .from('wiki_or_fiction_questions')
            .select('count', { count: 'exact', head: true })

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Manual Timeout at 5000ms')), 5000)
        );

        const { data, error } = await Promise.race([
            query,
            timeoutPromise
        ]) as any;

        const duration = Date.now() - start

        if (error) {
            console.error('Connection Failed:', error.message)
        } else {
            console.log('Connection Successful!')
            console.log('Time taken:', duration, 'ms')
            console.log('Data:', data)
            console.log('Count:', data)
        }
    } catch (err: any) {
        console.error('Connection Error Exception:', err.message)
    }
}

testConnection()
