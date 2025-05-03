// DOM Elements
const textInput = document.getElementById('text-input');
const characterCount = document.getElementById('character-count');
const wordCount = document.getElementById('word-count');
const sentenceCount = document.getElementById('sentence-count');
const readingTime = document.getElementById('reading-time');
const letterDensityViz = document.getElementById('letter-density-viz');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');
const logoImage = document.getElementById('logo-image');
const excludeSpacesToggle = document.getElementById('exclude-spaces-toggle');
const characterLimitToggle = document.getElementById('character-limit-toggle');
const seeMoreBtn = document.getElementById('see-more-btn');

// State Variables
let excludeSpaces = true;
let showAllLetters = false;
let letterFrequencyData = {};
let isDarkTheme = false;
let characterLimitEnabled = true;

// Constants
const CHARACTER_LIMIT = 5000;
const AVERAGE_READING_SPEED = 225; // words per minute
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

// Initialize
function init() {
  // Set initial state
  initializeTheme();
  
  // Add event listeners
  textInput.addEventListener('input', analyzeText);
  themeToggleBtn.addEventListener('click', toggleTheme);
  excludeSpacesToggle.addEventListener('change', toggleExcludeSpaces);
  characterLimitToggle.addEventListener('change', toggleCharacterLimit);
  
  if (seeMoreBtn) {
    seeMoreBtn.addEventListener('click', toggleShowAllLetters);
  }
  
  // Initialize empty state
  analyzeText();
}

// Analyze text function - called on input
function analyzeText() {
  const text = textInput.value;
  
  // Update counts
  updateCharacterCount(text);
  updateWordCount(text);
  updateSentenceCount(text);
  updateReadingTime(text);
  
  // Calculate letter frequency
  letterFrequencyData = calculateLetterFrequency(text);
  
  // Update letter density visualization
  updateLetterDensityUI();
}

// Calculate letter frequency
function calculateLetterFrequency(text) {
  const frequencyMap = {};
  const lowerCaseText = text.toLowerCase();
  
  // Initialize alphabet characters
  ALPHABET.split('').forEach(char => {
    frequencyMap[char] = 0;
  });
  
  // Count each character
  for (let i = 0; i < lowerCaseText.length; i++) {
    const char = lowerCaseText[i];
    
    // Skip spaces if exclude spaces is enabled
    if (char === ' ' && excludeSpaces) continue;
    
    // Only count letters and space
    if (ALPHABET.includes(char) || char === ' ') {
      frequencyMap[char] = (frequencyMap[char] || 0) + 1;
    }
  }
  
  return frequencyMap;
}

// Update letter density visualization
function updateLetterDensityUI() {
  // Clear previous visualization
  letterDensityViz.innerHTML = '';
  
  // Get data for visualization
  let data = [];
  
  if (showAllLetters) {
    // Include all alphabet letters
    ALPHABET.split('').forEach(char => {
      data.push({
        letter: char,
        count: letterFrequencyData[char] || 0
      });
    });
    
    // Add space if not excluded
    if (!excludeSpaces) {
      data.push({
        letter: 'space',
        count: letterFrequencyData[' '] || 0
      });
    }
  } else {
    // Only include letters that appear in the text
    for (const char in letterFrequencyData) {
      if (letterFrequencyData[char] > 0) {
        data.push({
          letter: char === ' ' ? 'space' : char,
          count: letterFrequencyData[char]
        });
      }
    }
  }
  
  // Sort by frequency (highest first)
  data.sort((a, b) => b.count - a.count);
  
  // Calculate total character count for percentage
  const totalChars = data.reduce((sum, item) => sum + item.count, 0);
  
  // Find the maximum count for scaling
  const maxCount = Math.max(...data.map(item => item.count), 1);
  
  // Limit to top 5 letters for initial display
  const displayData = showAllLetters ? data : data.slice(0, 5);
  
  // Create bars for visualization
  displayData.forEach(item => {
    // Create bar container
    const barContainer = document.createElement('div');
    barContainer.className = 'letter-bar';
    
    // Create letter label
    const letterLabel = document.createElement('div');
    letterLabel.className = 'letter-bar-label';
    letterLabel.textContent = item.letter;
    
    // Create visual bar container
    const barVisual = document.createElement('div');
    barVisual.className = 'letter-bar-visual';
    
    // Create visual bar fill
    const barFill = document.createElement('div');
    barFill.className = 'letter-bar-fill';
    
    // Calculate width percentage based on the maximum count
    const widthPercentage = item.count > 0 ? (item.count / maxCount) * 100 : 0;
    barFill.style.width = `${widthPercentage}%`;
    
    // Add bar fill to visual container
    barVisual.appendChild(barFill);
    
    // Create count label
    const countLabel = document.createElement('div');
    countLabel.className = 'letter-bar-count';
    countLabel.textContent = item.count;
    
    // Create percentage label
    const percentLabel = document.createElement('div');
    percentLabel.className = 'letter-bar-percent';
    const percent = totalChars > 0 ? ((item.count / totalChars) * 100).toFixed(1) : 0;
    percentLabel.textContent = `(${percent}%)`;
    
    // Assemble the bar
    barContainer.appendChild(letterLabel);
    barContainer.appendChild(barVisual);
    barContainer.appendChild(countLabel);
    barContainer.appendChild(percentLabel);
    
    // Add to visualization container
    letterDensityViz.appendChild(barContainer);
  });
}

// Update character count
function updateCharacterCount(text) {
  const count = text.length;
  characterCount.textContent = count;
  
  // Update textarea maxlength based on character limit setting
  if (characterLimitEnabled) {
    textInput.maxLength = CHARACTER_LIMIT;
  } else {
    textInput.removeAttribute('maxLength');
  }
}

// Update word count
function updateWordCount(text) {
  const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
  const count = words.length;
  wordCount.textContent = count;
}

// Update sentence count
function updateSentenceCount(text) {
  // Matches sentences ending with periods, question marks, exclamation points
  // while handling common abbreviations and edge cases
  const sentences = text.split(/[.!?]+(?=\s+|$)/);
  const count = sentences.length > 0 && sentences[0].trim() === '' ? 0 : sentences.length;
  sentenceCount.textContent = count;
}

// Update paragraph count
function updateParagraphCount(text) {
  const paragraphs = text.split(/\n+/).filter(para => para.trim() !== '');
  const count = paragraphs.length;
  paragraphCount.textContent = count;
}

// Update reading time
function updateReadingTime(text) {
  const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
  const minutes = Math.ceil(words.length / AVERAGE_READING_SPEED);
  readingTime.textContent = minutes > 0 ? `${minutes} min` : '< 1 min';
}

// Initialize theme based on system preference
function initializeTheme() {
  // Check if user has a saved preference
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    enableDarkTheme();
  } else if (savedTheme === 'light') {
    enableLightTheme();
  } else {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      enableDarkTheme();
    } else {
      enableLightTheme();
    }
  }
}

// Toggle dark/light theme
function toggleTheme() {
  if (isDarkTheme) {
    enableLightTheme();
  } else {
    enableDarkTheme();
  }
}

// Enable dark theme
function enableDarkTheme() {
  document.body.classList.add('dark-theme');
  themeIcon.src = 'images/icon-sun.svg';
  themeIcon.alt = 'Light mode';
  if (logoImage) {
    logoImage.src = 'images/logo-dark-theme.svg';
  }
  isDarkTheme = true;
  localStorage.setItem('theme', 'dark');
}

// Enable light theme
function enableLightTheme() {
  document.body.classList.remove('dark-theme');
  themeIcon.src = 'images/icon-moon.svg';
  themeIcon.alt = 'Dark mode';
  if (logoImage) {
    logoImage.src = 'images/logo-light-theme.svg';
  }
  isDarkTheme = false;
  localStorage.setItem('theme', 'light');
}

// Toggle exclude spaces option
function toggleExcludeSpaces() {
  excludeSpaces = excludeSpacesToggle.checked;
  analyzeText();
}

// Toggle show all letters option
function toggleShowAllLetters() {
  showAllLetters = !showAllLetters;
  updateLetterDensityUI();
  
  // Update see more button text
  if (seeMoreBtn) {
    seeMoreBtn.textContent = showAllLetters ? 'See less ▴' : 'See more ▾';
  }
}

// Toggle character limit
function toggleCharacterLimit() {
  characterLimitEnabled = characterLimitToggle.checked;
  
  if (characterLimitEnabled) {
    textInput.maxLength = CHARACTER_LIMIT;
  } else {
    textInput.removeAttribute('maxLength');
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);