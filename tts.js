// tts.js - Text-to-Speech logic for story content
(function() {
  // Helper: Get story content (exclude title/meta/buttons)
  function getStoryText() {
    const storyContent = document.querySelector('.story-content');
    if (!storyContent) return '';
    // Only get <p> tags (not images or back button)
    return Array.from(storyContent.querySelectorAll('p'))
      .map(p => p.innerText.trim())
      .filter(Boolean)
      .join(' ');
  }

  // Voice selection: Prefer gentle female voices
  function pickVoice() {
    const preferred = [
      'Google UK English Female',
      'Microsoft Zira',
      'Google US English',
      'en-GB', // fallback
      'en-US'
    ];
    const voices = window.speechSynthesis.getVoices();
    // Try to find the most gentle female voice
    for (const pref of preferred) {
      const match = voices.find(v => v.name.includes(pref) || v.lang === pref);
      if (match && (!match.gender || match.gender === 'female' || match.name.toLowerCase().includes('female'))) {
        return match;
      }
    }
    // fallback: first English female
    const female = voices.find(v => v.lang.startsWith('en') && (v.gender === 'female' || v.name.toLowerCase().includes('female')));
    if (female) return female;
    // fallback: any English
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  // Controls
  const ttsBtn = document.querySelector('.tts-btn');
  const ttsControls = document.querySelector('.tts-controls');
  const pauseBtn = document.querySelector('.tts-pause');
  const resumeBtn = document.querySelector('.tts-resume');
  const stopBtn = document.querySelector('.tts-stop');
  let utterance = null;
  let isPaused = false;

  function resetControls() {
    ttsControls.style.display = 'none';
    ttsBtn.disabled = false;
  }

  function speakStory() {
    const text = getStoryText();
    if (!text) return;
    window.speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance(text);
    // Wait for voices to load
    const setVoice = () => {
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 0.92; // gentle pace
      utterance.pitch = 1.09; // slightly soft
      utterance.volume = 1.0;
      utterance.onend = resetControls;
      utterance.onerror = resetControls;
      window.speechSynthesis.speak(utterance);
      ttsBtn.disabled = true;
      ttsControls.style.display = 'block';
      isPaused = false;
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    } else {
      setVoice();
    }
  }

  ttsBtn && ttsBtn.addEventListener('click', speakStory);

  pauseBtn && pauseBtn.addEventListener('click', function() {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      isPaused = true;
    }
  });

  resumeBtn && resumeBtn.addEventListener('click', function() {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      isPaused = false;
    }
  });

  stopBtn && stopBtn.addEventListener('click', function() {
    window.speechSynthesis.cancel();
    resetControls();
  });

  // Stop TTS if user navigates away
  window.addEventListener('beforeunload', function() {
    window.speechSynthesis.cancel();
  });
})();
