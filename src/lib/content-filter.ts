import { supabase } from './supabase'

interface BlockedWord {
  id: string
  word: string
  replacement: string
  severity: 'low' | 'medium' | 'high'
}

let blockedWordsCache: BlockedWord[] = []
let lastCacheUpdate = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch and cache blocked words from database
 */
async function getBlockedWords(): Promise<BlockedWord[]> {
  const now = Date.now()

  // Return cached words if still valid
  if (blockedWordsCache.length > 0 && now - lastCacheUpdate < CACHE_DURATION) {
    return blockedWordsCache
  }

  try {
    const { data, error } = await supabase
      .from('blocked_words')
      .select('id, word, replacement, severity')

    if (error) throw error

    blockedWordsCache = data || []
    lastCacheUpdate = now
    return blockedWordsCache
  } catch (error) {
    console.error('Error fetching blocked words:', error)
    return []
  }
}

/**
 * Check if content contains any blocked words and return severity level
 */
export async function checkContentSeverity(content: string): Promise<{
  hasBannedContent: boolean
  severity: 'low' | 'medium' | 'high' | null
  blockedWords: string[]
}> {
  const blockedWords = await getBlockedWords()
  const contentLower = content.toLowerCase()

  const foundWords: string[] = []
  let maxSeverity: 'low' | 'medium' | 'high' | null = null

  for (const word of blockedWords) {
    // Case-insensitive word boundary matching
    const regex = new RegExp(`\\b${word.word}\\b`, 'gi')
    if (regex.test(contentLower)) {
      foundWords.push(word.word)

      // Track the highest severity
      if (!maxSeverity || word.severity === 'high' ||
          (word.severity === 'medium' && maxSeverity === 'low')) {
        maxSeverity = word.severity
      }
    }
  }

  return {
    hasBannedContent: foundWords.length > 0,
    severity: maxSeverity,
    blockedWords: foundWords,
  }
}

/**
 * Filter content by replacing blocked words
 */
export async function filterContent(content: string): Promise<string> {
  const blockedWords = await getBlockedWords()
  let filteredContent = content

  for (const word of blockedWords) {
    // Case-insensitive replacement with word boundary
    const regex = new RegExp(`\\b${word.word}\\b`, 'gi')
    filteredContent = filteredContent.replace(regex, word.replacement)
  }

  return filteredContent
}

/**
 * Log content violation for moderation
 */
export async function logContentViolation(
  messageId: string,
  userId: string,
  severity: string,
  blockedWords: string[]
) {
  try {
    await supabase
      .from('content_violations')
      .insert({
        message_id: messageId,
        user_id: userId,
        severity,
        blocked_words: blockedWords,
        created_at: new Date().toISOString(),
      })
  } catch (error) {
    console.error('Error logging content violation:', error)
  }
}

/**
 * Clear cache manually (useful after admin updates blocked words)
 */
export function clearBlockedWordsCache() {
  blockedWordsCache = []
  lastCacheUpdate = 0
}
