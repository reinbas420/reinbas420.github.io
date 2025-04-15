document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('nav a').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          window.scrollTo({
              top: targetElement.offsetTop - 70,
              behavior: 'smooth'
          });
      });
  });

  function setupEventTracking() {
      document.addEventListener('click', function(event) {
          const target = event.target;
          let objectType = 'unknown';

          if (target.tagName === 'A') objectType = 'link';
          else if (target.tagName === 'IMG') objectType = 'image';
          else if (target.tagName === 'LI') objectType = 'list-item';
          else if (target.closest('nav')) objectType = 'navigation';
          else if (target.tagName === 'H1' || target.tagName === 'H2') objectType = 'heading';
          else if (['P', 'SPAN', 'B', 'SUP'].includes(target.tagName)) objectType = 'text';
          else if (target.className === 'skill') objectType = 'skill-badge';
          else if (target.className === 'cv-link') objectType = 'download-button';
          else if (target.id === 'textInput') objectType = 'text-input';
          if (target.className === 'profile-pic' || target.closest('.profile-pic')) objectType = 'profile-picture';
          else if (target.closest('.birthplace-gallery')) objectType = 'birthplace-image';

          const timestamp = new Date().toISOString();
          console.log(`${timestamp}, click, ${objectType}`);
      });

      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  const element = entry.target;
                  let objectType = 'unknown';

                  if (element.id === 'home') objectType = 'home-section';
                  else if (element.id === 'about') objectType = 'about-section';
                  else if (element.id === 'birthplace') objectType = 'birthplace-section';
                  else if (element.id === 'eduback') objectType = 'education-section';
                  else if (element.id === 'skills') objectType = 'skills-section';
                  else if (element.id === 'text-analyzer') objectType = 'text-analyzer-section';
                  else if (element.tagName === 'IMG') {
                      if (element.className === 'profile-pic') objectType = 'profile-picture';
                      else if (element.closest('.birthplace-gallery')) objectType = 'birthplace-image';
                      else objectType = 'image';
                  }

                  const timestamp = new Date().toISOString();
                  console.log(`${timestamp}, view, ${objectType}`);
              }
          });
      }, { threshold: 0.5 });

      document.querySelectorAll('section, img').forEach(element => {
          observer.observe(element);
      });
  }

  setupEventTracking();

  function countTextStatistics(text) {
      const letters = (text.match(/[a-zA-Z]/g) || []).length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const spaces = (text.match(/\s/g) || []).length;
      const newlines = (text.match(/\n/g) || []).length;
      const specialSymbols = (text.match(/[^\w\s]/g) || []).length;

      return { letters, words, spaces, newlines, specialSymbols };
  }

  function countPronouns(text) {
      const pronouns = [
          "i", "me", "my", "mine", "myself",
          "you", "your", "yours", "yourself", "yourselves",
          "he", "him", "his", "himself",
          "she", "her", "hers", "herself",
          "it", "its", "itself",
          "we", "us", "our", "ours", "ourselves",
          "they", "them", "their", "theirs", "themselves",
          "who", "whom", "whose", "which", "that",
          "what", "whatever", "whoever", "whomever",
          "this", "these", "that", "those"
      ];

      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      const pronounCounts = {};

      pronouns.forEach(p => pronounCounts[p] = 0);
      words.forEach(w => { if (pronouns.includes(w)) pronounCounts[w]++; });

      return Object.fromEntries(Object.entries(pronounCounts).filter(([_, c]) => c > 0));
  }

  function countPrepositions(text) {
      const prepositions = [
          "about", "above", "across", "after", "against", "along", "amid", "among",
          "around", "at", "before", "behind", "below", "beneath", "beside", "between",
          "beyond", "by", "concerning", "considering", "despite", "down", "during",
          "except", "for", "from", "in", "inside", "into", "like", "near", "of",
          "off", "on", "onto", "out", "outside", "over", "past", "regarding",
          "round", "since", "through", "throughout", "to", "toward", "towards",
          "under", "underneath", "until", "unto", "up", "upon", "with", "within", "without"
      ];

      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      const counts = {};
      prepositions.forEach(p => counts[p] = 0);
      words.forEach(w => { if (prepositions.includes(w)) counts[w]++; });

      return Object.fromEntries(Object.entries(counts).filter(([_, c]) => c > 0));
  }

  function countIndefiniteArticles(text) {
      const articles = ["a", "an"];
      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      const counts = { "a": 0, "an": 0 };

      words.forEach(w => { if (articles.includes(w)) counts[w]++; });

      return counts;
  }

  function displayResults(results) {
      const resultsContainer = document.getElementById('analysisResults');
      resultsContainer.innerHTML = '';

      const statsDiv = document.createElement('div');
      statsDiv.className = 'stats-container';
      statsDiv.innerHTML = `
          <h3>Basic Text Statistics</h3>
          <p>Letters: ${results.statistics.letters}</p>
          <p>Words: ${results.statistics.words}</p>
          <p>Spaces: ${results.statistics.spaces}</p>
          <p>Newlines: ${results.statistics.newlines}</p>
          <p>Special Symbols: ${results.statistics.specialSymbols}</p>`;
      resultsContainer.appendChild(statsDiv);

      const pronounDiv = document.createElement('div');
      pronounDiv.className = 'count-container';
      pronounDiv.innerHTML = '<h3>Pronoun Counts</h3>';
      if (Object.keys(results.pronouns).length > 0) {
          const list = document.createElement('div');
          for (const [k, v] of Object.entries(results.pronouns)) {
              list.innerHTML += `<p>${k}: ${v}</p>`;
          }
          pronounDiv.appendChild(list);
      } else {
          pronounDiv.innerHTML += '<p>No pronouns found.</p>';
      }
      resultsContainer.appendChild(pronounDiv);

      const prepositionDiv = document.createElement('div');
      prepositionDiv.className = 'count-container';
      prepositionDiv.innerHTML = '<h3>Preposition Counts</h3>';
      if (Object.keys(results.prepositions).length > 0) {
          const list = document.createElement('div');
          for (const [k, v] of Object.entries(results.prepositions)) {
              list.innerHTML += `<p>${k}: ${v}</p>`;
          }
          prepositionDiv.appendChild(list);
      } else {
          prepositionDiv.innerHTML += '<p>No prepositions found.</p>';
      }
      resultsContainer.appendChild(prepositionDiv);

      const articleDiv = document.createElement('div');
      articleDiv.className = 'count-container';
      articleDiv.innerHTML = '<h3>Indefinite Article Counts</h3>';
      const a = results.articles.a;
      const an = results.articles.an;
      if (a > 0 || an > 0) {
          const list = document.createElement('div');
          if (a > 0) list.innerHTML += `<p>a: ${a}</p>`;
          if (an > 0) list.innerHTML += `<p>an: ${an}</p>`;
          articleDiv.appendChild(list);
      } else {
          articleDiv.innerHTML += '<p>No indefinite articles found.</p>';
      }
      resultsContainer.appendChild(articleDiv);
  }

  function analyzeText() {
      const textInput = document.getElementById('textInput').value;
      if (!textInput.trim()) {
          document.getElementById('analysisResults').innerHTML = '<p>Please enter some text to analyze.</p>';
          return;
      }

      const statistics = countTextStatistics(textInput);
      const pronouns = countPronouns(textInput);
      const prepositions = countPrepositions(textInput);
      const articles = countIndefiniteArticles(textInput);

      const results = { statistics, pronouns, prepositions, articles };
      displayResults(results);
  }

  document.getElementById('textInput').addEventListener('input', analyzeText);
});
