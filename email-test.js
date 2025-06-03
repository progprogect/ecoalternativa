const nodemailer = require('nodemailer');

// Различные варианты настроек для тестирования
const emailConfigs = [
  {
    name: 'Конфигурация 1 - Порт 587 STARTTLS',
    config: {
      host: 'mailbe07.hoster.by',
      port: 587,
      secure: false,
      auth: {
        user: 'info@ecoalternativa.ru',
        pass: '2{D~9AkEti'
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Конфигурация 2 - Порт 465 SSL',
    config: {
      host: 'mailbe07.hoster.by',
      port: 465,
      secure: true,
      auth: {
        user: 'info@ecoalternativa.ru',
        pass: '2{D~9AkEti'
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Конфигурация 3 - Порт 25',
    config: {
      host: 'mailbe07.hoster.by',
      port: 25,
      secure: false,
      auth: {
        user: 'info@ecoalternativa.ru',
        pass: '2{D~9AkEti'
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Конфигурация 4 - Альтернативный хост',
    config: {
      host: 'smtp.mailbe07.hoster.by',
      port: 587,
      secure: false,
      auth: {
        user: 'info@ecoalternativa.ru',
        pass: '2{D~9AkEti'
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  }
];

async function testEmailConfig(config, name) {
  console.log(`\n🧪 Тестируем: ${name}`);
  console.log(`   Хост: ${config.host}:${config.port} (secure: ${config.secure})`);
  
  try {
    const transporter = nodemailer.createTransport(config);
    
    // Проверяем подключение
    await transporter.verify();
    console.log(`✅ ${name} - Подключение успешно!`);
    
    // Пробуем отправить тестовое письмо
    const result = await transporter.sendMail({
      from: '"Экологическая Альтернатива" <info@ecoalternativa.ru>',
      to: 'progprogect@gmail.com',
      subject: '🧪 Тест настройки email - ' + name,
      text: `Тестовое сообщение для проверки настройки email.\n\nКонфигурация: ${name}\nВремя: ${new Date().toLocaleString('ru-RU')}`,
      html: `
        <h2>🧪 Тест настройки email</h2>
        <p><strong>Конфигурация:</strong> ${name}</p>
        <p><strong>Время:</strong> ${new Date().toLocaleString('ru-RU')}</p>
        <p>Если вы получили это письмо, значит настройка работает корректно!</p>
        <hr>
        <p><small>Автоматическое тестовое сообщение с сайта ecoalternativa.ru</small></p>
      `
    });
    
    console.log(`🎉 ${name} - Email отправлен успешно!`);
    console.log(`   Message ID: ${result.messageId}`);
    return { success: true, config, name, messageId: result.messageId };
    
  } catch (error) {
    console.log(`❌ ${name} - Ошибка:`, error.message);
    return { success: false, config, name, error: error.message };
  }
}

async function runEmailTests() {
  console.log('🚀 Начинаем тестирование настроек email...\n');
  
  const results = [];
  
  for (const { config, name } of emailConfigs) {
    const result = await testEmailConfig(config, name);
    results.push(result);
    
    if (result.success) {
      console.log('🎯 Найдена рабочая конфигурация! Прекращаем тестирование.');
      break;
    }
    
    // Пауза между тестами
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 Результаты тестирования:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.success ? 'Работает' : result.error}`);
  });
  
  const workingConfig = results.find(r => r.success);
  if (workingConfig) {
    console.log('\n🎉 Рекомендуемая конфигурация:');
    console.log(JSON.stringify(workingConfig.config, null, 2));
  } else {
    console.log('\n😞 Ни одна конфигурация не работает. Возможные причины:');
    console.log('   • Неверные учетные данные');
    console.log('   • Блокировка файервола');
    console.log('   • Проблемы с сетью');
    console.log('   • Сервер требует особые настройки');
  }
}

// Запускаем тестирование
runEmailTests().catch(console.error); 