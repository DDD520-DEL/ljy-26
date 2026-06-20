import { useState, useMemo } from 'react';
import { MessageSquare, Heart, Send, Filter, Shield, Clock } from 'lucide-react';
import { useAppStore } from '@/store';
import { MESSAGE_CATEGORIES, ANONYMOUS_ENCOURAGE_TEMPLATES, ANONYMOUS_COMPLAINT_TEMPLATES, ANONYMOUS_OTHER_TEMPLATES } from '@/constants';
import { formatTimeAgo } from '@/utils';
import type { MessageCategory } from '@/types';

export default function AnonymousWall() {
  const {
    anonymousMessages,
    addAnonymousMessage,
    likeAnonymousMessage,
    isAnonymousMessageLiked,
  } = useAppStore();

  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MessageCategory>('encourage');
  const [filterCategory, setFilterCategory] = useState<MessageCategory | 'all'>('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredMessages = useMemo(() => {
    if (filterCategory === 'all') return anonymousMessages;
    return anonymousMessages.filter(m => m.category === filterCategory);
  }, [anonymousMessages, filterCategory]);

  const stats = useMemo(() => {
    const total = anonymousMessages.length;
    const encourage = anonymousMessages.filter(m => m.category === 'encourage').length;
    const complaint = anonymousMessages.filter(m => m.category === 'complaint').length;
    const other = anonymousMessages.filter(m => m.category === 'other').length;
    const totalLikes = anonymousMessages.reduce((sum, m) => sum + m.likes, 0);
    return { total, encourage, complaint, other, totalLikes };
  }, [anonymousMessages]);

  const templates = useMemo(() => {
    switch (category) {
      case 'encourage':
        return ANONYMOUS_ENCOURAGE_TEMPLATES;
      case 'complaint':
        return ANONYMOUS_COMPLAINT_TEMPLATES;
      case 'other':
        return ANONYMOUS_OTHER_TEMPLATES;
      default:
        return [];
    }
  }, [category]);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      addAnonymousMessage(content.trim(), category);
      setContent('');
      setShowTemplates(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateClick = (template: string) => {
    setContent(template);
    setShowTemplates(false);
  };

  const handleLike = (messageId: string) => {
    likeAnonymousMessage(messageId);
  };

  const getCategoryConfig = (cat: MessageCategory) => {
    return MESSAGE_CATEGORIES.find(c => c.id === cat) || MESSAGE_CATEGORIES[2];
  };

  const filterItems = [
    { id: 'all' as const, label: '全部', icon: '📋', color: 'text-slate-600 dark:text-slate-300', bgColor: 'bg-slate-100 dark:bg-slate-700' },
    ...MESSAGE_CATEGORIES,
  ];

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="animate-fade-in-up">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 md:p-10 text-white shadow-xl">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-4 right-8 text-6xl opacity-20 animate-float">💬</div>
          <div className="absolute bottom-6 right-32 text-4xl opacity-15 animate-float delay-200">✨</div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 md:w-5 md:h-5 opacity-80" />
              <span className="text-sm md:text-base opacity-90">100% 匿名保护</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl mb-3">
              匿名留言墙 🎭
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-6 md:mb-8 max-w-lg">
              给换水的同事加油打气，或者吐槽一下那些从来不换水的人～你的身份绝对保密！
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20 animate-fade-in-up" style={{ animationDelay: '0s' }}>
                <div className="text-2xl md:text-3xl mb-1">📝</div>
                <div className="font-display text-xl md:text-3xl">{stats.total}</div>
                <div className="text-xs md:text-sm text-white/70">总留言数</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-2xl md:text-3xl mb-1">💪</div>
                <div className="font-display text-xl md:text-3xl">{stats.encourage}</div>
                <div className="text-xs md:text-sm text-white/70">加油鼓励</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-2xl md:text-3xl mb-1">😤</div>
                <div className="font-display text-xl md:text-3xl">{stats.complaint}</div>
                <div className="text-xs md:text-sm text-white/70">吐槽抱怨</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="text-2xl md:text-3xl mb-1">💬</div>
                <div className="font-display text-xl md:text-3xl">{stats.other}</div>
                <div className="text-xs md:text-sm text-white/70">其他建议</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-2xl md:text-3xl mb-1">❤️</div>
                <div className="font-display text-xl md:text-3xl">{stats.totalLikes}</div>
                <div className="text-xs md:text-sm text-white/70">获得点赞</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-card p-5 md:p-8 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <Send className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl text-slate-800 dark:text-slate-100">发布匿名留言</h2>
              <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500">你的身份将被完全保密 🔒</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">选择留言类型</label>
              <div className="flex flex-wrap gap-2">
                {MESSAGE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      category === cat.id
                        ? `${cat.bgColor} ${cat.color} ring-2 ring-offset-2 dark:ring-offset-slate-800 ring-current scale-105 shadow-md`
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">留言内容</label>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {showTemplates ? '收起模板' : '使用模板'}
                </button>
              </div>

              {showTemplates && (
                <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 dark:bg-indigo-900/20 dark:bg-indig dark:border-indigo-800/30o-900/20 dark:bg-ind00 dark:border-indigo-8ig/30o-900/20 rounded-xl bo dark:border-indigo-800/30rder border-indigo-100 dark:border-indigo-800/30">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 dark:text-indigo-400 dark:text-indigo-400 mb-2 font-medium">选择一个模板快速填写：</p>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((tpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTemplateClick(tpl)}
                        className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-800/30 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-colors text-left max-w-full truncate"
                      >
                        {tpl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="说点什么吧...你的身份绝对保密 🔒"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all resize-none text-sm md:text-base"
                rows={3}
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs ${content.length > 180 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {content.length}/200
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium text-sm hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? '发送中...' : '匿名发送'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Filter className="w-5 h-5 md:w-6 md:h-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl text-slate-800 dark:text-slate-100">留言列表</h2>
              <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500">共 {filteredMessages.length} 条留言</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 md:gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            {filterItems.map(item => (
              <button
                key={item.id}
                onClick={() => setFilterCategory(item.id)}
                className={`flex items-center gap-1 px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                  filterCategory === item.id
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl p-10 md:p-16 text-center border border-slate-100 dark:border-slate-700">
            <div className="text-5xl md:text-6xl mb-4">💬</div>
            <h3 className="font-display text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-2">
              {filterCategory === 'all' ? '暂无留言' : `暂无${MESSAGE_CATEGORIES.find(c => c.id === filterCategory)?.label}留言`}
            </h3>
            <p className="text-sm md:text-base text-slate-400 dark:text-slate-500 max-w-md mx-auto">
              {filterCategory === 'all'
                ? '快来发布第一条匿名留言吧！无论是加油鼓励还是吐槽抱怨，都可以在这里畅所欲言～'
                : '换个分类看看，或者发布第一条这个类型的留言吧！'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredMessages.map((message, idx) => {
              const catConfig = getCategoryConfig(message.category);
              const liked = isAnonymousMessageLiked(message.id);
              const isRecent = Date.now() - new Date(message.timestamp).getTime() < 24 * 60 * 60 * 1000;

              return (
                <div
                  key={message.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 p-4 md:p-5 hover:shadow-md transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-2xl md:text-3xl flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
                      🎭
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-display text-sm md:text-base text-slate-800 dark:text-slate-100">
                          匿名用户
                        </span>
                        {isRecent && (
                          <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-full">
                            NEW
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${catConfig.bgColor} ${catConfig.color}`}>
                          <span>{catConfig.icon}</span>
                          <span>{catConfig.label}</span>
                        </span>
                      </div>

                      <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed mb-3">
                        {message.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs md:text-sm text-slate-400 dark:text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTimeAgo(message.timestamp)}</span>
                        </div>

                        <button
                          onClick={() => handleLike(message.id)}
                          disabled={liked}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 ${
                            liked
                              ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 cursor-default'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-800/30'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                          <span>{message.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
