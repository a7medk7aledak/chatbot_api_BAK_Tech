const chatBox = document.getElementById('chat-box');
const form = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const suggestions = document.getElementById('suggestions');

// كلمات الترحيب المتغيرة
const welcomeMessages = [
  "مرحباً بك! كيف يمكنني مساعدتك اليوم؟",
  "أهلاً بك في مساعد المبيعات الذكي! ماذا تحتاج؟",
  "مرحباً! أنا هنا للإجابة على استفساراتك حول منتجاتنا وخدماتنا"
];

// إستجابات سريعة لأسئلة شائعة مع إضافة المزيد من الردود المخصصة
const quickResponses = {
  "عروض": "العروض الحالية تشمل خصم 20% على الإلكترونيات وعروض 1+1 على الملابس الرياضية حتى نهاية الشهر!",
  "دفع": "نقبل الدفع بالبطاقات الائتمانية، والدفع عند الاستلام، والتحويل المصرفي، ومحافظ الجوال الإلكترونية.",
  "توصيل": "التوصيل مجاني للطلبات التي تزيد عن 200 ريال، ويستغرق من 2-5 أيام عمل.",
  "إرجاع": "سياسة الإرجاع تسمح باسترداد أو استبدال المنتجات خلال 14 يوماً من الاستلام مع الاحتفاظ بالفاتورة.",
  "عطر": "لدينا تشكيلة واسعة من العطور الفاخرة، مثل Black Velvet للسهرات (خصم 20% اليوم)، وFresh Morning للاستخدام اليومي، وArabian Nights للمناسبات الخاصة!",
  "عطور": "أحدث العطور لدينا: Black Velvet للسهرات (فخم وثابت)، Fresh Morning للصباح والعمل، وArabian Nights للمناسبات المميزة. جميعها متوفرة بخصم 15% لفترة محدودة!",
  "سهرات": "للسهرات نوصي بعطر Black Velvet الفاخر - رائحة عميقة وثابتة مع لمسات من المسك والعنبر، مثالي للمناسبات الليلية وعليه خصم 20% اليوم فقط!",
  "ملابس": "وصلت تشكيلة الموسم الجديدة من الملابس العصرية! استمتع بخصم 25% على الأزياء الرسمية وعروض 1+1 على الملابس الرياضية",
  "أحذية": "أحذية موسم الربيع متوفرة الآن! تشكيلة فاخرة من الماركات العالمية بخصم يصل إلى 30% وشحن مجاني للطلبات فوق 300 ريال",
  "إكسسوارات": "إكسسوارات فاخرة تناسب إطلالتك: ساعات، نظارات، وحقائب من أرقى الماركات بخصومات استثنائية تبدأ من 20% هذا الأسبوع فقط"
};

// حالة الشات
let chatHistory = [];
let isWaitingForResponse = false;

// إضافة مستمع لأحداث النموذج
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  
  if (!question || isWaitingForResponse) return;
  
  sendMessage(question);
});

// إضافة مستمعي أحداث للاقتراحات
function setupSuggestionListeners() {
  document.querySelectorAll('.suggestion-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const query = pill.getAttribute('data-query');
      userInput.value = query;
      sendMessage(query);
    });
  });
}

// تنفيذ وظيفة إعداد المستمعين بعد تحميل الصفحة
window.addEventListener('DOMContentLoaded', setupSuggestionListeners);

// وظيفة إرسال الرسالة
async function sendMessage(question) {
  displayMessage(question, 'user');
  userInput.value = '';
  isWaitingForResponse = true;
  
  // إظهار مؤشر الكتابة
  showTypingIndicator();
  
  // التحقق من الإجابات السريعة أولاً
  let quickResponse = checkQuickResponses(question);
  if (quickResponse) {
    // محاكاة تأخير الرد للواقعية
    await sleep(1000);
    hideTypingIndicator();
    displayMessage(quickResponse, 'bot');
    isWaitingForResponse = false;
    return;
  }
  
  try {
    const reply = await fetchBotReply(question);
    hideTypingIndicator();
    displayMessage(reply, 'bot');
  } catch (error) {
    hideTypingIndicator();
    displayMessage("عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.", 'bot');
    console.error("Error:", error);
  }
  
  isWaitingForResponse = false;
}

// عرض الرسالة في صندوق الدردشة
function displayMessage(text, sender) {
  const message = document.createElement('div');
  message.classList.add('message', sender);
  
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  message.appendChild(paragraph);
  
  // إضافة طابع زمني للرسالة
  const timestamp = document.createElement('small');
  timestamp.classList.add('timestamp');
  timestamp.textContent = getCurrentTime();
  message.appendChild(timestamp);
  
  chatBox.appendChild(message);
  
  // تمرير إلى أسفل
  chatBox.scrollTop = chatBox.scrollHeight;
  
  // تخزين المحادثة في الذاكرة المؤقتة فقط
  chatHistory.push({ role: sender === 'user' ? 'user' : 'assistant', content: text });
}

// إظهار مؤشر الكتابة
function showTypingIndicator() {
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'typing-indicator';
  typingIndicator.className = 'typing-indicator';
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    typingIndicator.appendChild(dot);
  }
  
  chatBox.appendChild(typingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// إخفاء مؤشر الكتابة
function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// الحصول على الوقت الحالي بتنسيق 12 ساعة
function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'م' : 'ص';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // الساعة '0' يجب أن تكون '12'
  
  return `${hours}:${minutes} ${ampm}`;
}

// وظيفة للتأخير
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// التحقق من الإجابات السريعة بطريقة أكثر تفصيلاً
function checkQuickResponses(question) {
  question = question.toLowerCase();
  
  // التحقق من العطور والسهرات
  if (question.includes('عطر') && question.includes('سهر')) {
    return "ننصحك بـ عطر \"Black Velvet\" للسهرات لأنه فخم، ثابت، ومناسب للجو الليلي. والأجمل؟ عليه خصم 20% النهارده!";
  }
  
  if (question.includes('عطر') && question.includes('مناسب') && (question.includes('سهر') || question.includes('ليل'))) {
    return "ننصحك بـ عطر \"Black Velvet\" للسهرات لأنه فخم، ثابت، ومناسب للجو الليلي. والأجمل؟ عليه خصم 20% النهارده!";
  }
  
  if (question.includes('عطر') && question.includes('رجال')) {
    return "للرجال، نوصي بعطر \"Royal Oud\" الذي يتميز برائحة خشبية فاخرة تدوم طويلاً. متوفر الآن بخصم 25% كعرض حصري!";
  }
  
  if (question.includes('عطر') && question.includes('نساء')) {
    return "للنساء، اكتشفي عطر \"Moonlight Bloom\" بمزيج رائع من الورود والفانيليا. يدوم لأكثر من 12 ساعة وعليه خصم 20% هذا الأسبوع!";
  }
  
  if (question.includes('عطر') && question.includes('صباح')) {
    return "لإطلالة صباحية منعشة، جرب عطر \"Fresh Morning\" بمزيج من الحمضيات والزهور الخفيفة. مثالي للعمل والمناسبات النهارية!";
  }
  
  // تحقق من المنتجات الأخرى
  if (question.includes('ملابس') && question.includes('رياض')) {
    return "قسم الملابس الرياضية لدينا يقدم أحدث التصاميم من ماركات عالمية مع عروض 1+1 مجاناً هذا الأسبوع! تشكيلة متنوعة تناسب جميع التمارين والرياضات.";
  }
  
  if (question.includes('أحذية') && question.includes('رياض')) {
    return "أحذية رياضية من أشهر الماركات العالمية! خفيفة، مريحة، ومناسبة لجميع التمارين. استمتع بخصم 30% على التشكيلة الجديدة ودفع بالتقسيط لمدة 3 أشهر بدون فوائد!";
  }
  
  // فحص الكلمات المفتاحية العامة
  if (question.includes('عروض') || question.includes('خصم') || question.includes('تخفيض')) {
    return quickResponses.عروض;
  }
  
  if (question.includes('دفع') || question.includes('سداد') || question.includes('بطاقة')) {
    return quickResponses.دفع;
  }
  
  if (question.includes('توصيل') || question.includes('شحن') || question.includes('وصول')) {
    return quickResponses.توصيل;
  }
  
  if (question.includes('إرجاع') || question.includes('استبدال') || question.includes('استرداد')) {
    return quickResponses.إرجاع;
  }
  
  if (question.includes('عطر') || question.includes('عطور') || question.includes('رائحة')) {
    return quickResponses.عطر;
  }
  
  if (question.includes('سهرة') || question.includes('سهرات') || question.includes('مناسبة')) {
    return quickResponses.سهرات;
  }
  
  if (question.includes('ملابس') || question.includes('أزياء') || question.includes('ثياب')) {
    return quickResponses.ملابس;
  }
  
  if (question.includes('أحذية') || question.includes('حذاء') || question.includes('جزمة')) {
    return quickResponses.أحذية;
  }
  
  if (question.includes('إكسسوار') || question.includes('ساعة') || question.includes('نظارة') || question.includes('حقيبة')) {
    return quickResponses.إكسسوارات;
  }
  
  return null;
}

// جلب رد من DeepSeek API (باستخدام واجهة متوافقة مع OpenAI)
async function fetchBotReply(message) {
  try {
    // استخدام مفتاح API DeepSeek
    const apiKey = "YOUR_API_KEY";
    
    // تجميع سجل المحادثة للسياق
    const messageHistory = [
      { role: "system", content: "أنت مساعد مبيعات محترف وودود في متجر للعطور والملابس والإكسسوارات. أجب باللغة العربية بأسلوب تسويقي مقنع وشخصي. قدم توصيات محددة للمنتجات مع ذكر الخصومات والعروض الحالية. استخدم لغة حماسية وشجع العملاء على الشراء." }
    ];
    
    // إضافة آخر 5 رسائل من المحادثة للسياق (إذا وجدت)
    const recentMessages = chatHistory.slice(-5);
    messageHistory.push(...recentMessages);
    
    // إضافة السؤال الحالي
    messageHistory.push({ role: "user", content: message });
    
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messageHistory,
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`خطأ في الاستجابة من الخادم (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // استخراج الرد من استجابة DeepSeek
    const reply = data?.choices?.[0]?.message?.content || "لم أتمكن من الحصول على رد.";
    
    return reply;

  } catch (error) {
    console.error("حدث خطأ أثناء الاتصال بـ DeepSeek API:", error);
    return "عذرًا، حدث خطأ أثناء الاتصال بالمساعد. يرجى المحاولة مرة أخرى لاحقًا.";
  }
}

// تنفيذ أكشن عند تحميل الصفحة
window.addEventListener('load', () => {
  // إضافة تأثير تمرير سلس للشات
  chatBox.style.scrollBehavior = 'smooth';
  
  // عرض رسالة ترحيب عشوائية
  const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  displayMessage(randomWelcome, 'bot');
});

// إضافة مستمع لحدث تعديل الإدخال لتعطيل/تمكين زر الإرسال
userInput.addEventListener('input', () => {
  const submitButton = document.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = !userInput.value.trim();
  }
});

// إظهار اقتراحات التشغيل التلقائي بناءً على إدخال المستخدم
userInput.addEventListener('input', () => {
  const query = userInput.value.toLowerCase().trim();
  
  // إعادة تعيين اقتراحات التشغيل التلقائي
  if (suggestions) {
    suggestions.innerHTML = '';
    
    // إذا كان هناك إدخال وليس في انتظار رد، أظهر اقتراحات
    if (query && !isWaitingForResponse) {
      // حدد الاقتراحات بناءً على الإدخال
      const filteredSuggestions = [];
      
      // اقتراحات محسنة تشمل المنتجات الجديدة
      const allSuggestions = ['عروض', 'دفع', 'توصيل', 'إرجاع', 'عطور', 'ملابس', 'أحذية', 'إكسسوارات'];
      
      allSuggestions.forEach(suggestion => {
        if (suggestion.includes(query)) filteredSuggestions.push(suggestion);
      });
      
      // إظهار الاقتراحات المصفاة
      filteredSuggestions.forEach(suggestion => {
        const pill = document.createElement('span');
        pill.className = 'suggestion-pill';
        pill.setAttribute('data-query', suggestion);
        pill.textContent = suggestion;
        pill.addEventListener('click', () => {
          userInput.value = suggestion;
          sendMessage(suggestion);
        });
        suggestions.appendChild(pill);
      });
    }
  }
});