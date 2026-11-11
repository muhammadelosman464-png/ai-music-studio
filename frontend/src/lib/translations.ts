export type Locale = 'en' | 'ar'

export const translations = {
  en: {
    // Brand & Nav
    brandTitle: 'AI Music Studio',
    brandTagline: 'Transform your hum or audio into a master track',
    poweredBy: 'V2 Pro Engine • Advanced AI Pipeline',
    tabStudio: 'Studio Production',
    tabStems: 'Isolate Stems',
    tabVoice: 'Voice Transformer',
    tabLibrary: 'Cloud Library',
    backendSettings: 'Backend',

    // Statuses
    statusReady: 'Studio Ready',
    statusRecording: 'Recording Mic',
    statusProcessing: 'Producing Master',
    statusDone: 'Master Ready',
    statusError: 'Production Alert',

    // Hero
    heroTitle: 'Ultimate AI Music Production Studio',
    heroSubtitle:
      'Record your humming or upload any raw melody. Our AI orchestrates melody conditioning, RVC voice conversion, acoustic BPM/Key detection, and multi-stem mastering.',

    // Audio Input
    audioInputMode: 'Melody Input Source',
    tabRecord: 'Record Microphone',
    tabUpload: 'Upload Audio File',
    uploadPrompt: 'Click or drag & drop an audio file (.wav, .mp3, .m4a, .ogg)',
    uploadSuccess: 'Audio file loaded ready for analysis',
    changeFile: 'Choose different file',
    micRecordStart: 'Start Recording',
    micRecordStop: 'Stop & Use Audio',
    micListening: 'Listening to your voice... Sing or hum clearly',
    audioReady: 'Audio Captured Ready',
    reRecord: 'Re-record / Clear',

    // Presets & Prompt
    styleSectionTitle: 'Musical Style & Atmosphere',
    presetsTitle: 'Signature Oriental & Global Presets',
    presetLevantine: 'Levantine Pop (بوب شامي)',
    presetTarab: 'Emotional Tarab (طرب حزين)',
    presetDabke: 'Dabke / Chobi (دبكة وجوبي)',
    presetPiano: 'Cinematic Piano (بيانو سينمائي)',
    presetLofi: 'Lo-Fi Chill (لو فاي)',
    presetEdm: 'EDM Festival (إلكترونيك)',
    promptPlaceholder: "Describe your musical vision... (e.g., 'Modern energetic Arabic pop with riq and dramatic strings')",
    charCount: 'characters',

    // Lyrics
    lyricsTitle: 'Song Lyrics (Optional)',
    lyricsSubtitle: 'Provide original lyrics for vocal melody phrasing',
    lyricsPlaceholder: 'Paste your verses and chorus here...\n[Verse 1]\nيا ليل يا عيني...\n[Chorus]\n...',

    // Studio Toggles
    masteringToggle: 'AI Studio Mastering',
    masteringDesc: 'Apply multiband analog saturation, stereo widening, and -14 LUFS loudness',
    voiceModelLabel: 'AI Voice Identity',

    // Produce CTA
    produceButton: 'Produce Master Track ✨',
    producingWait: 'Orchestrating AI Pipeline...',
    produceRequirements: 'Capture or upload audio to produce',

    // Stepper
    stepUpload: 'Uploading Audio',
    stepUploadDesc: 'Securing audio to cloud storage',
    stepMelody: 'Generating Melody & BPM',
    stepMelodyDesc: 'Conditioning musical arrangement',
    stepVoice: 'Transforming Voice',
    stepVoiceDesc: 'Applying RVC vocal synthesis',
    stepStems: 'Separating 4 Stems',
    stepStemsDesc: 'Meta HTDemucs multi-track isolation',

    // Multitrack Player
    multitrackTitle: 'Master Multitrack Console',
    multitrackSubtitle: 'Dynamic Mute / Solo playback across all isolated channels',
    masterPlayback: 'Master Play',
    masterPause: 'Master Pause',
    downloadZip: 'Download All Stems (ZIP)',
    downloadingZip: 'Archiving ZIP...',
    trackFull: 'Full Mastered Track',
    trackVocals: 'Isolated AI Vocals',
    trackInstrumental: 'Melody & Instruments',
    trackDrums: 'Drums & Percussion',
    trackBass: 'Sub Bass & Low-End',
    mute: 'Mute',
    muted: 'Muted',
    solo: 'Solo',
    soloActive: 'Solo Active',
    download: 'Download',
    bpmLabel: 'Detected BPM',
    keyLabel: 'Key / Maqam',
    masteredBadge: 'Mastered',

    // Stem Separator Tab
    stemsTabTitle: 'Standalone AI Stem Separator',
    stemsTabSubtitle: 'Upload ANY commercial song or personal demo to extract 4 clean, isolated studio stems using Meta HTDemucs.',
    stemsUploadPrompt: 'Upload any mixed song (.mp3, .wav, .m4a)',
    separateButton: 'Separate Stems Now 🎛️',
    separatingWait: 'Demixing Audio Stems with HTDemucs...',

    // Voice Transformer Tab
    voiceTabTitle: 'RVC Studio Voice Transformer',
    voiceTabSubtitle: 'Transform raw vocal recordings into professional studio timbre using Retrieval-based Voice Conversion.',
    voiceUploadPrompt: 'Upload or record raw vocal track',
    targetVoiceLabel: 'Target Voice Character',
    pitchLabel: 'Pitch Shift',
    transformButton: 'Transform Voice Now 🎤',
    transformingWait: 'Synthesizing Voice Conversion...',

    // Cloud Library Tab
    libraryTabTitle: 'Cloud Studio Library',
    libraryTabSubtitle: 'Your historical audio generations, detected scales, and prompt archive in Supabase.',
    noTracksYet: 'No tracks recorded in the cloud yet. Create your first production in the Studio tab!',
    loadToPlayer: 'Load into Console',
    dateLabel: 'Created',

    // Backend Modal
    backendTitle: 'Backend API Connection',
    backendDesc: 'Configure your cloud Render or local FastAPI endpoint.',
    backendTest: 'Test Connection',
    backendSave: 'Save & Apply',
    backendTesting: 'Testing connectivity...',
  },

  ar: {
    // Brand & Nav
    brandTitle: 'استوديو الموسيقى بالذكاء الاصطناعي',
    brandTagline: 'حوّل دندنتك أو تسجيلك إلى عمل موسيقي احترافي متكامل',
    poweredBy: 'محرك الجيل الثاني V2 • ذكاء اصطناعي فائق الدقة',
    tabStudio: 'الإنتاج الموسيقي',
    tabStems: 'عزل المسارات (Stems)',
    tabVoice: 'محوّل الصوت (RVC)',
    tabLibrary: 'المكتبة السحابية',
    backendSettings: 'سيرفر الباك إند',

    // Statuses
    statusReady: 'الاستوديو جاهز',
    statusRecording: 'جارٍ تسجيل الصوت',
    statusProcessing: 'جارٍ هندسة الأغنية',
    statusDone: 'الماستر جاهز',
    statusError: 'تنبيه في النظام',

    // Hero
    heroTitle: 'استوديو الإنتاج الموسيقي الاحترافي بالذكاء الاصطناعي',
    heroSubtitle:
      'سجّل دندنتك أو ارفع ملفاً صوتياً. يقوم نظامنا باكتشاف الإيقاع والمقام تلقائياً، وتأليف توزيع موسيقي كامل، وتحويل الصوت، وعزل 4 مسارات مع ماسترينغ استوديو عالمي.',

    // Audio Input
    audioInputMode: 'مصدر اللحن الصوتي',
    tabRecord: 'تسجيل عبر المايكروفون',
    tabUpload: 'رفع ملف صوتي من جهازك',
    uploadPrompt: 'اضغط أو اسحب ملف صوتي هنا (.wav, .mp3, .m4a, .ogg)',
    uploadSuccess: 'تم تحميل الملف الصوتي وهو جاهز للتحليل',
    changeFile: 'تغيير الملف',
    micRecordStart: 'بدء التسجيل',
    micRecordStop: 'إيقاف واعتماد التسجيل',
    micListening: 'نستمع لصوتك الآن... دندن أو غنِّ اللحن بوضوح',
    audioReady: 'تم التقاط الصوت وجاهز للإنتاج',
    reRecord: 'إعادة التسجيل / مسح',

    // Presets & Prompt
    styleSectionTitle: 'النمط الموسيقي والجو العام',
    presetsTitle: 'أنماط موسيقية شرقية وعالمية مختارة',
    presetLevantine: 'بوب شامي (Levantine Pop)',
    presetTarab: 'طرب حزين أصيل (Emotional Tarab)',
    presetDabke: 'دبكة وجوبي (Dabke / Chobi)',
    presetPiano: 'بيانو سينمائي (Cinematic Piano)',
    presetLofi: 'لو-فاي مريح (Lo-Fi Chill)',
    presetEdm: 'حفلات ومهرجانات (EDM Festival)',
    promptPlaceholder: "صف النمط والتوزيع الموسيقي... (مثال: 'بوب عربي حديث مع إيقاع شرقي ووتريات سينمائية درامية')",
    charCount: 'حرف',

    // Lyrics
    lyricsTitle: 'كلمات الأغنية (اختياري)',
    lyricsSubtitle: 'أدخل كلماتك المخصصة لتوجيه اللحن والتأليف الغنائي',
    lyricsPlaceholder: 'الصق كلمات الأغنية هنا (المذهب، الكوبليهات)...\n[مذهب]\nيا ليل يا عين...\n[كوبليه]\nحبيبي اللي غاب...',

    // Studio Toggles
    masteringToggle: 'ماسترينغ احترافي (AI Mastering)',
    masteringDesc: 'تفعيل التشبع التناظري الدافئ، وتوسيع الستيريو وضبط مستوى الصوت المعياري -14 LUFS',
    voiceModelLabel: 'هوية الصوت والفوكال',

    // Produce CTA
    produceButton: 'إنتاج العمل الموسيقي الكامل ✨',
    producingWait: 'جارٍ توزيع وهندسة المسارات الصوتية...',
    produceRequirements: 'يرجى تسجيل أو رفع ملف صوتي أولاً',

    // Stepper
    stepUpload: 'رفع وتحليل الصوت',
    stepUploadDesc: 'اكتشاف الإيقاع BPM والمقام الموسيقي',
    stepMelody: 'تأليف وتوزيع اللحن',
    stepMelodyDesc: 'مواءمة التوزيع الآلي مع صوتك',
    stepVoice: 'تحويل وبناء الفوكال',
    stepVoiceDesc: 'تطبيق تقنية RVC المتقدمة للصوت',
    stepStems: 'عزل 4 مسارات صوتية',
    stepStemsDesc: 'فصل الآلات والطبول والبيز بتقنية HTDemucs',

    // Multitrack Player
    multitrackTitle: 'طاولة المكساج متعددة المسارات (Multitrack Console)',
    multitrackSubtitle: 'تحكّم ديناميكي في كتم (Mute) أو إفراد (Solo) كل مسار بالتزامن التام',
    masterPlayback: 'تشغيل الماستر العام',
    masterPause: 'إيقاف مؤقت',
    downloadZip: 'تحميل جميع المسارات في ملف واحد (ZIP)',
    downloadingZip: 'جارٍ تجميع ملف الـ ZIP...',
    trackFull: 'الماستر النهائي الكامل',
    trackVocals: 'المسار الصوتي البشري (Vocals)',
    trackInstrumental: 'الآلات الموسيقية (Melody)',
    trackDrums: 'الإيقاعات والطبول (Drums)',
    trackBass: 'الباص والترددات المنخفضة (Bass)',
    mute: 'كتم',
    muted: 'مكتوم',
    solo: 'سولو',
    soloActive: 'سولو مفعل',
    download: 'تحميل',
    bpmLabel: 'الإيقاع المقاس (BPM)',
    keyLabel: 'المقام / السلّم',
    masteredBadge: 'ماسترينغ مفعل',

    // Stem Separator Tab
    stemsTabTitle: 'أداة عزل المسارات المستقلة (Stem Separator)',
    stemsTabSubtitle: 'ارفع أي أغنية تجارية أو تسجيل كامل ليتم فصلها فورياً إلى: غناء، طبول، بيز، وتوزيع موسيقي.',
    stemsUploadPrompt: 'ارفع أي أغنية مدمجة (.mp3, .wav, .m4a)',
    separateButton: 'بدء عزل المسارات 🎛️',
    separatingWait: 'جارٍ فصل المسارات بتقنية HTDemucs المتقدمة...',

    // Voice Transformer Tab
    voiceTabTitle: 'محوّل الصوت الذكي (RVC Voice Studio)',
    voiceTabSubtitle: 'حوّل خامة صوتك إلى أصوات استوديو احترافية مع إمكانية تعديل الطبقة (Pitch Shift).',
    voiceUploadPrompt: 'ارفع أو سجّل مسار الفوكال الخام',
    targetVoiceLabel: 'خامة الصوت المستهدفة',
    pitchLabel: 'تعديل الطبقة الصوتية (Pitch)',
    transformButton: 'تحويل خامة الصوت الآن 🎤',
    transformingWait: 'جارٍ تحويل ومعالجة الصوت بتقنية RVC...',

    // Cloud Library Tab
    libraryTabTitle: 'المكتبة السحابية للاستوديو',
    libraryTabSubtitle: 'أرشيف جميع أعمالك الموسيقية ومقاماتها وكلماتها المحفوظة في Supabase.',
    noTracksYet: 'لا توجد أعمال محفوظة في السحابة حتى الآن. ابدأ بإنتاج أول أغنية من تبويب الاستوديو!',
    loadToPlayer: 'تشغيل في طاولة المكساج',
    dateLabel: 'تاريخ الإنتاج',

    // Backend Modal
    backendTitle: 'إعدادات اتصال السيرفر (Backend)',
    backendDesc: 'اضبط رابط سيرفر البايثون الخاص بك على Render أو السيرفر المحلي.',
    backendTest: 'فحص الاتصال',
    backendSave: 'حفظ واعتماد الرابط',
    backendTesting: 'جارٍ اختبار الاتصال بالسيرفر...',
  },
}
