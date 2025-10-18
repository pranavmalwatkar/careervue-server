// Sentiment analysis utility for messages

// Positive keywords that indicate good feedback
const positiveKeywords = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
  'perfect', 'outstanding', 'superb', 'brilliant', 'impressive', 'love',
  'best', 'helpful', 'satisfied', 'happy', 'pleased', 'thank', 'thanks',
  'appreciate', 'grateful', 'recommend', 'professional', 'quality', 'efficient',
  'smooth', 'easy', 'user-friendly', 'reliable', 'fast', 'quick', 'responsive',
  'beautiful', 'modern', 'clean', 'intuitive', 'useful', 'valuable', 'top-notch'
];

// Negative keywords that indicate bad feedback
const negativeKeywords = [
  'bad', 'poor', 'terrible', 'awful', 'horrible', 'worst', 'hate',
  'disappointed', 'frustrating', 'slow', 'difficult', 'confusing', 'complicated',
  'broken', 'error', 'bug', 'issue', 'problem', 'fail', 'failed', 'wrong',
  'not working', 'doesnt work', 'useless', 'waste', 'annoying', 'irritating',
  'outdated', 'old', 'ugly', 'messy', 'hard', 'impossible', 'never', 'cant'
];

/**
 * Analyze message sentiment based on keywords
 * @param {string} text - Message text to analyze
 * @returns {Object} - Sentiment analysis result
 */
export const analyzeSentiment = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      sentiment: 'neutral',
      score: 0,
      positiveCount: 0,
      negativeCount: 0
    };
  }

  const lowerText = text.toLowerCase();
  
  // Count positive keywords
  let positiveCount = 0;
  positiveKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  });

  // Count negative keywords
  let negativeCount = 0;
  negativeKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  });

  // Calculate sentiment score (-1 to 1)
  const totalKeywords = positiveCount + negativeCount;
  let score = 0;
  let sentiment = 'neutral';

  if (totalKeywords > 0) {
    score = (positiveCount - negativeCount) / totalKeywords;
    
    if (score > 0.3) {
      sentiment = 'positive';
    } else if (score < -0.3) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }
  }

  return {
    sentiment,
    score,
    positiveCount,
    negativeCount,
    totalKeywords
  };
};

/**
 * Batch analyze multiple messages
 * @param {Array} messages - Array of message objects
 * @returns {Array} - Messages with sentiment data
 */
export const analyzeMessagesBatch = (messages) => {
  return messages.map(message => {
    const sentiment = analyzeSentiment(
      `${message.subject || ''} ${message.message || ''}`
    );
    return {
      ...message,
      sentiment: sentiment.sentiment,
      sentimentScore: sentiment.score
    };
  });
};

/**
 * Get sentiment statistics for messages
 * @param {Array} messages - Array of messages with sentiment
 * @returns {Object} - Sentiment statistics
 */
export const getSentimentStats = (messages) => {
  const stats = {
    total: messages.length,
    positive: 0,
    negative: 0,
    neutral: 0,
    averageScore: 0
  };

  let totalScore = 0;

  messages.forEach(msg => {
    const sentiment = analyzeSentiment(
      `${msg.subject || ''} ${msg.message || ''}`
    );
    
    if (sentiment.sentiment === 'positive') stats.positive++;
    else if (sentiment.sentiment === 'negative') stats.negative++;
    else stats.neutral++;
    
    totalScore += sentiment.score;
  });

  stats.averageScore = stats.total > 0 ? totalScore / stats.total : 0;
  stats.positivePercentage = stats.total > 0 ? (stats.positive / stats.total) * 100 : 0;
  stats.negativePercentage = stats.total > 0 ? (stats.negative / stats.total) * 100 : 0;
  stats.neutralPercentage = stats.total > 0 ? (stats.neutral / stats.total) * 100 : 0;

  return stats;
};
