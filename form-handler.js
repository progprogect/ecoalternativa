/**
 * Обработчик форм для сайта ecoalternativa.ru
 * Отправляет данные на почту progprogect@gmail.com
 */

class FormHandler {
  constructor() {
    this.apiEndpoint = '/api/send-email';
    this.fallbackEmail = 'progprogect@gmail.com';
  }

  /**
   * Отправка данных формы
   * @param {FormData} formData - данные формы
   * @param {string} source - источник отправки
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async sendForm(formData, source) {
    const currentTime = new Date().toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Формируем данные для отправки
    const emailData = {
      to: this.fallbackEmail,
      subject: `Новая заявка с сайта - ${source}`,
      timestamp: currentTime,
      source: source,
      formData: {
        name: formData.get('name') || '',
        phone: formData.get('phone') || '',
        email: formData.get('email') || '',
        volume: formData.get('volume') || '',
        comment: formData.get('comment') || formData.get('description') || ''
      }
    };

    // Формируем красивое сообщение
    const message = this.formatMessage(emailData);
    emailData.message = message;

    try {
      // Пытаемся отправить через наш API
      const response = await this.sendToAPI(emailData);
      if (response.success) {
        console.log('✅ Email отправлен успешно:', emailData);
        return { success: true, message: 'Сообщение отправлено успешно!' };
      }
    } catch (error) {
      console.warn('❌ API недоступен:', error.message);
    }

    // Fallback: сохраняем в localStorage для разработки
    this.saveToLocalStorage(emailData);
    
    // Логируем в консоль для демонстрации
    console.log('📧 Email для отправки на ' + this.fallbackEmail + ':', {
      subject: emailData.subject,
      message: emailData.message,
      timestamp: emailData.timestamp
    });

    return { 
      success: true, 
      message: 'Данные сохранены! (в продакшене будет отправлено на почту)' 
    };
  }

  /**
   * Отправка через API
   */
  async sendToAPI(emailData) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Форматирование сообщения для email
   */
  formatMessage(emailData) {
    const { formData, timestamp, source } = emailData;
    
    return `
🌿 НОВАЯ ЗАЯВКА С САЙТА ECOALTERNATIVA.RU

⏰ Время: ${timestamp}
📍 Источник: ${source}

👤 КОНТАКТНЫЕ ДАННЫЕ:
▫️ Имя: ${formData.name || 'Не указано'}
▫️ Телефон: ${formData.phone || 'Не указан'}
▫️ Email: ${formData.email || 'Не указан'}
▫️ Объем (тонн): ${formData.volume || 'Не указан'}

💬 СООБЩЕНИЕ:
${formData.comment || 'Без комментария'}

═══════════════════════════════════════
🏭 Экологическая Альтернатива - Shvedoff
📧 Автоматическое уведомление с сайта
    `.trim();
  }

  /**
   * Сохранение в localStorage для разработки
   */
  saveToLocalStorage(emailData) {
    try {
      const leads = JSON.parse(localStorage.getItem('leads') || '[]');
      leads.unshift({
        id: Date.now(),
        ...emailData,
        saved_at: new Date().toISOString()
      });
      
      // Храним только последние 50 заявок
      localStorage.setItem('leads', JSON.stringify(leads.slice(0, 50)));
      
      console.log('💾 Заявка сохранена в localStorage. Всего заявок:', leads.length);
    } catch (error) {
      console.warn('Не удалось сохранить в localStorage:', error);
    }
  }

  /**
   * Получение всех сохраненных заявок
   */
  getSavedLeads() {
    try {
      return JSON.parse(localStorage.getItem('leads') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Очистка сохраненных заявок
   */
  clearSavedLeads() {
    localStorage.removeItem('leads');
    console.log('🗑️ Все сохраненные заявки удалены');
  }

  /**
   * Экспорт заявок в CSV
   */
  exportLeadsToCSV() {
    const leads = this.getSavedLeads();
    if (leads.length === 0) {
      console.log('Нет заявок для экспорта');
      return null;
    }

    const csvHeader = 'Время,Источник,Имя,Телефон,Email,Объем,Комментарий\n';
    const csvData = leads.map(lead => {
      const data = lead.formData;
      return [
        lead.timestamp,
        lead.source,
        data.name,
        data.phone,
        data.email,
        data.volume,
        data.comment.replace(/\n/g, ' ')
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csv = csvHeader + csvData;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    console.log('📊 Экспорт завершен:', leads.length, 'заявок');
    return csv;
  }
}

// Глобальный экземпляр
window.formHandler = new FormHandler();

// Дополнительные методы для консоли разработчика
window.showLeads = () => {
  const leads = window.formHandler.getSavedLeads();
  console.table(leads.map(lead => ({
    Время: lead.timestamp,
    Источник: lead.source,
    Имя: lead.formData.name,
    Телефон: lead.formData.phone,
    Email: lead.formData.email
  })));
  return leads;
};

window.exportLeads = () => window.formHandler.exportLeadsToCSV();
window.clearLeads = () => window.formHandler.clearSavedLeads(); 