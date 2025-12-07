import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 辅助函数：生成随机单号
function generateNo(prefix: string): string {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}${dateStr}${random}`;
}

// 辅助函数：生成随机日期（过去n天内）
function randomPastDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return date;
}

// 辅助函数：生成未来日期（未来n天内）
function randomFutureDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * days) + 1);
  return date;
}

async function main() {
  console.log('开始初始化数据...');

  // 1. 创建默认管理员
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      nickname: '超级管理员',
      role: 'admin',
      status: 1,
    },
  });
  console.log('创建管理员:', admin.username);

  // 2. 创建科室分类
  const categories = [
    { name: '内科' },
    { name: '外科' },
    { name: '妇产科' },
    { name: '儿科' },
    { name: '五官科' },
    { name: '中医科' },
    { name: '医技科' },
  ];

  for (const cat of categories) {
    await prisma.departmentCategory.upsert({
      where: { name: cat.name },
      update: cat,
      create: { ...cat, sort: categories.indexOf(cat) + 1 },
    });
  }
  console.log('创建科室分类:', categories.length);

  // 3. 创建科室
  const departments = [
    { code: 'XNK', categoryId: 1, name: '心内科', description: '心血管内科疾病诊治', location: '门诊楼2层', phone: '0571-88888001' },
    { code: 'HXNK', categoryId: 1, name: '呼吸内科', description: '呼吸系统疾病诊治', location: '门诊楼2层', phone: '0571-88888002' },
    { code: 'XHNK', categoryId: 1, name: '消化内科', description: '消化系统疾病诊治', location: '门诊楼3层', phone: '0571-88888003' },
    { code: 'SJNK', categoryId: 1, name: '神经内科', description: '神经系统疾病诊治', location: '门诊楼3层', phone: '0571-88888004' },
    { code: 'PWK', categoryId: 2, name: '普外科', description: '普通外科手术', location: '门诊楼4层', phone: '0571-88888005' },
    { code: 'GK', categoryId: 2, name: '骨科', description: '骨骼、关节疾病诊治', location: '门诊楼4层', phone: '0571-88888006' },
    { code: 'MNWK', categoryId: 2, name: '泌尿外科', description: '泌尿系统疾病诊治', location: '门诊楼5层', phone: '0571-88888007' },
    { code: 'FK', categoryId: 3, name: '妇科', description: '妇科疾病诊治', location: '门诊楼6层', phone: '0571-88888008' },
    { code: 'CK', categoryId: 3, name: '产科', description: '产前检查、分娩', location: '门诊楼6层', phone: '0571-88888009' },
    { code: 'XENK', categoryId: 4, name: '小儿内科', description: '儿童内科疾病诊治', location: '门诊楼7层', phone: '0571-88888010' },
    { code: 'YK', categoryId: 5, name: '眼科', description: '眼部疾病诊治', location: '门诊楼8层', phone: '0571-88888011' },
    { code: 'EBHK', categoryId: 5, name: '耳鼻喉科', description: '耳鼻喉疾病诊治', location: '门诊楼8层', phone: '0571-88888012' },
    { code: 'KQK', categoryId: 5, name: '口腔科', description: '口腔疾病诊治', location: '门诊楼8层', phone: '0571-88888013' },
    { code: 'ZYNK', categoryId: 6, name: '中医内科', description: '中医内科诊疗', location: '门诊楼9层', phone: '0571-88888014' },
    { code: 'JYK', categoryId: 7, name: '检验科', description: '医学检验', location: '医技楼1层', phone: '0571-88888015' },
    { code: 'YXK', categoryId: 7, name: '影像科', description: 'CT、MRI、X光检查', location: '医技楼2层', phone: '0571-88888016' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: dept,
      create: { ...dept, status: 1 },
    });
  }
  console.log('创建科室:', departments.length);

  // 4. 创建医生
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctors = [
    { employeeNo: 'D001', departmentId: 1, name: '张明', title: '主任医师', specialty: '冠心病、高血压', introduction: '从医30年，擅长心血管疾病诊治', phone: '13900001001' },
    { employeeNo: 'D002', departmentId: 1, name: '李华', title: '副主任医师', specialty: '心律失常、心力衰竭', introduction: '从医20年，专注心脏电生理', phone: '13900001002' },
    { employeeNo: 'D003', departmentId: 2, name: '王强', title: '主任医师', specialty: '哮喘、肺癌', introduction: '呼吸科专家', phone: '13900001003' },
    { employeeNo: 'D004', departmentId: 3, name: '赵雪', title: '副主任医师', specialty: '胃炎、肠炎', introduction: '消化内镜专家', phone: '13900001004' },
    { employeeNo: 'D005', departmentId: 5, name: '刘伟', title: '主任医师', specialty: '腹腔镜手术', introduction: '普外科手术专家', phone: '13900001005' },
    { employeeNo: 'D006', departmentId: 6, name: '陈刚', title: '副主任医师', specialty: '骨折、关节置换', introduction: '骨科微创手术专家', phone: '13900001006' },
    { employeeNo: 'D007', departmentId: 8, name: '吴芳', title: '主任医师', specialty: '妇科肿瘤', introduction: '妇科专家', phone: '13900001007' },
    { employeeNo: 'D008', departmentId: 10, name: '周丽', title: '副主任医师', specialty: '儿童感冒、发热', introduction: '儿科专家', phone: '13900001008' },
  ];

  for (const doc of doctors) {
    await prisma.doctor.upsert({
      where: { employeeNo: doc.employeeNo },
      update: { ...doc, password: doctorPassword },
      create: { ...doc, password: doctorPassword, status: 1 },
    });
  }
  console.log('创建医生:', doctors.length);

  // 5. 创建药品分类
  const medicineCategories = [
    { name: '西药' },
    { name: '中成药' },
    { name: '中药饮片' },
    { name: '保健品' },
  ];

  for (const cat of medicineCategories) {
    await prisma.medicineCategory.upsert({
      where: { name: cat.name },
      update: cat,
      create: { ...cat, sort: medicineCategories.indexOf(cat) + 1 },
    });
  }
  console.log('创建药品分类:', medicineCategories.length);

  // 6. 创建药品
  const medicines = [
    { code: 'MED001', categoryId: 1, name: '阿莫西林胶囊', specification: '0.5g*24粒', manufacturer: '华北制药', unit: '盒', price: 15.00, stock: 1000 },
    { code: 'MED002', categoryId: 1, name: '布洛芬缓释片', specification: '0.3g*20片', manufacturer: '中美史克', unit: '盒', price: 22.50, stock: 800 },
    { code: 'MED003', categoryId: 1, name: '阿司匹林肠溶片', specification: '100mg*30片', manufacturer: '拜耳', unit: '盒', price: 28.00, stock: 600 },
    { code: 'MED004', categoryId: 1, name: '奥美拉唑肠溶胶囊', specification: '20mg*14粒', manufacturer: '阿斯利康', unit: '盒', price: 35.00, stock: 500 },
    { code: 'MED005', categoryId: 1, name: '氯雷他定片', specification: '10mg*6片', manufacturer: '扬子江药业', unit: '盒', price: 18.00, stock: 700 },
    { code: 'MED006', categoryId: 2, name: '板蓝根颗粒', specification: '10g*20袋', manufacturer: '白云山', unit: '盒', price: 12.00, stock: 1200 },
    { code: 'MED007', categoryId: 2, name: '感冒清热颗粒', specification: '12g*10袋', manufacturer: '同仁堂', unit: '盒', price: 16.00, stock: 900 },
    { code: 'MED008', categoryId: 2, name: '六味地黄丸', specification: '200丸', manufacturer: '同仁堂', unit: '瓶', price: 25.00, stock: 400 },
  ];

  for (const med of medicines) {
    await prisma.medicine.upsert({
      where: { code: med.code },
      update: med,
      create: { ...med, status: 1 },
    });
  }
  console.log('创建药品:', medicines.length);

  // 7. 创建体检项目
  const examItems = [
    { name: '血常规', price: 25.00, description: '血液常规检查' },
    { name: '尿常规', price: 20.00, description: '尿液常规检查' },
    { name: '肝功能', price: 80.00, description: '肝功能检查' },
    { name: '肾功能', price: 60.00, description: '肾功能检查' },
    { name: '血糖', price: 15.00, description: '空腹血糖检查' },
    { name: '血脂', price: 50.00, description: '血脂四项检查' },
    { name: '心电图', price: 30.00, description: '12导联心电图' },
    { name: '胸部X光', price: 80.00, description: '胸部正侧位片' },
    { name: 'B超（肝胆脾）', price: 120.00, description: '腹部B超检查' },
    { name: '甲状腺功能', price: 150.00, description: '甲功五项检查' },
  ];

  for (const item of examItems) {
    await prisma.examItem.upsert({
      where: { name: item.name },
      update: item,
      create: { ...item, status: 1 },
    });
  }
  console.log('创建体检项目:', examItems.length);

  // 8. 创建系统配置
  const systemConfigs = [
    { key: 'hospital_name', value: '智慧医疗中心', remark: '医院名称' },
    { key: 'hospital_phone', value: '0571-88888888', remark: '联系电话' },
    { key: 'hospital_address', value: '浙江省杭州市西湖区文三路100号', remark: '医院地址' },
    { key: 'hospital_email', value: 'contact@hospital.com', remark: '邮箱' },
    { key: 'working_hours', value: '周一至周日 8:00-17:00', remark: '工作时间' },
    { key: 'hospital_intro', value: '智慧医疗中心是一家集医疗、教学、科研为一体的现代化综合医院。', remark: '医院简介' },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: config,
      create: config,
    });
  }
  console.log('创建系统配置:', systemConfigs.length);

  // 9. 创建导航服务
  const navigations = [
    { startPoint: '医院大门', endPoint: '门诊大厅', transport: '步行', duration: '2分钟', description: '进门直走即可到达' },
    { startPoint: '门诊大厅', endPoint: '急诊科', transport: '步行', duration: '3分钟', description: '从大厅右侧通道步行' },
    { startPoint: '门诊大厅', endPoint: '住院部', transport: '步行', duration: '5分钟', description: '从大厅左侧电梯上楼' },
  ];

  for (const nav of navigations) {
    await prisma.navigation.create({
      data: nav,
    });
  }
  console.log('创建导航服务:', navigations.length);

  // 10. 创建页面内容
  const pageContents = [
    { type: 'about', title: '关于我们', content: '<h2>医院简介</h2><p>智慧医疗中心成立于2000年，是一家集医疗、教学、科研为一体的现代化综合性医院...</p>' },
    { type: 'intro', title: '系统介绍', content: '<h2>系统介绍</h2><p>智慧医疗系统为您提供便捷的在线医疗服务...</p>' },
  ];

  for (const page of pageContents) {
    await prisma.pageContent.upsert({
      where: { type: page.type },
      update: page,
      create: page,
    });
  }
  console.log('创建页面内容:', pageContents.length);

  // 11. 创建新闻
  const newsList = [
    { title: '我院引进最新CT设备', summary: '为提升诊疗水平，我院引进最新设备', content: '<p>为提升诊疗水平，我院引进了最新一代256层螺旋CT...</p>', status: 1, isTop: true },
    { title: '春季养生小贴士', summary: '春季养生注意事项', content: '<p>春季是养生的好时节，建议多吃蔬菜水果...</p>', status: 1, isTop: false },
    { title: '五一假期门诊安排通知', summary: '五一期间门诊安排', content: '<p>五一假期期间，我院门诊正常开诊...</p>', status: 1, isTop: false },
  ];

  for (const item of newsList) {
    await prisma.news.create({
      data: item,
    });
  }
  console.log('创建新闻:', newsList.length);

  // 12. 创建测试患者（扩展为多个）
  const patientPassword = await bcrypt.hash('patient123', 10);
  const patientsData = [
    { username: 'patient', name: '张三', gender: 'male', phone: '13800138000', age: 30, idCard: '330102199001011234', medicalCardNo: 'MC202401001' },
    { username: 'lisi', name: '李四', gender: 'male', phone: '13800138001', age: 45, idCard: '330102197901021235', medicalCardNo: 'MC202401002' },
    { username: 'wangwu', name: '王五', gender: 'male', phone: '13800138002', age: 28, idCard: '330102199601031236', medicalCardNo: 'MC202401003' },
    { username: 'zhaoliu', name: '赵六', gender: 'female', phone: '13800138003', age: 35, idCard: '330102198901041237', medicalCardNo: 'MC202401004' },
    { username: 'sunqi', name: '孙七', gender: 'female', phone: '13800138004', age: 52, idCard: '330102197201051238', medicalCardNo: 'MC202401005' },
    { username: 'zhouba', name: '周八', gender: 'male', phone: '13800138005', age: 60, idCard: '330102196401061239', medicalCardNo: 'MC202401006' },
    { username: 'wujiu', name: '吴九', gender: 'female', phone: '13800138006', age: 22, idCard: '330102200201071240', medicalCardNo: 'MC202401007' },
    { username: 'zhengshi', name: '郑十', gender: 'male', phone: '13800138007', age: 40, idCard: '330102198401081241', medicalCardNo: 'MC202401008' },
    { username: 'chenxiao', name: '陈小明', gender: 'male', phone: '13800138008', age: 8, idCard: '330102201601091242', medicalCardNo: 'MC202401009' },
    { username: 'liuxia', name: '刘夏', gender: 'female', phone: '13800138009', age: 33, idCard: '330102199101101243', medicalCardNo: 'MC202401010' },
  ];

  const createdPatients: { id: number; name: string }[] = [];
  for (const p of patientsData) {
    const patient = await prisma.patient.upsert({
      where: { username: p.username },
      update: {},
      create: {
        ...p,
        password: patientPassword,
        balance: Math.floor(Math.random() * 1000),
        status: 1,
      },
    });
    createdPatients.push({ id: patient.id, name: patient.name });
  }
  console.log('创建患者:', createdPatients.length);

  // 13. 获取已创建的医生和科室
  const allDoctors = await prisma.doctor.findMany();
  const allDepartments = await prisma.department.findMany();

  // 14. 创建排班数据（今天到未来7天）
  const timeSlots = ['08:00-12:00', '14:00-17:30'];
  const fees = [15, 25, 50, 100];
  const schedulesCreated: { id: number; doctorId: number; date: Date }[] = [];

  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + dayOffset);
    scheduleDate.setHours(0, 0, 0, 0);

    for (const doctor of allDoctors) {
      for (const slot of timeSlots) {
        const existingSchedule = await prisma.schedule.findUnique({
          where: {
            doctorId_date_timeSlot: {
              doctorId: doctor.id,
              date: scheduleDate,
              timeSlot: slot,
            },
          },
        });

        if (!existingSchedule) {
          const schedule = await prisma.schedule.create({
            data: {
              doctorId: doctor.id,
              departmentId: doctor.departmentId,
              date: scheduleDate,
              timeSlot: slot,
              maxPatients: 20,
              bookedCount: Math.floor(Math.random() * 10),
              fee: fees[Math.floor(Math.random() * fees.length)],
              status: 1,
            },
          });
          schedulesCreated.push({ id: schedule.id, doctorId: doctor.id, date: scheduleDate });
        }
      }
    }
  }
  console.log('创建排班:', schedulesCreated.length);

  // 15. 创建预约/挂号数据
  const appointmentStatuses = [0, 1, 2]; // 0:待就诊 1:已就诊 2:已取消
  const appointmentsCreated: { id: number; patientId: number; doctorId: number; scheduleId: number }[] = [];

  // 获取有效排班
  const validSchedules = await prisma.schedule.findMany({
    where: { status: 1 },
    take: 50,
  });

  for (let i = 0; i < 30; i++) {
    const patient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
    const schedule = validSchedules[Math.floor(Math.random() * validSchedules.length)];
    const doctor = allDoctors.find(d => d.id === schedule.doctorId);
    if (!doctor) continue;

    try {
      const appointment = await prisma.appointment.create({
        data: {
          appointmentNo: generateNo('GH'),
          patientId: patient.id,
          doctorId: doctor.id,
          departmentId: doctor.departmentId,
          scheduleId: schedule.id,
          date: schedule.date,
          timeSlot: schedule.timeSlot,
          fee: schedule.fee,
          queueNo: Math.floor(Math.random() * 20) + 1,
          status: appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)],
        },
      });
      appointmentsCreated.push({
        id: appointment.id,
        patientId: patient.id,
        doctorId: doctor.id,
        scheduleId: schedule.id,
      });
    } catch (e) {
      // 忽略重复预约错误
    }
  }
  console.log('创建预约:', appointmentsCreated.length);

  // 16. 创建病历数据（针对已就诊的预约）
  const completedAppointments = await prisma.appointment.findMany({
    where: { status: 1 },
    take: 15,
  });

  const diagnosisList = [
    { chiefComplaint: '头痛、头晕3天', diagnosis: '偏头痛', suggestion: '注意休息，避免劳累' },
    { chiefComplaint: '咳嗽、发热2天', diagnosis: '上呼吸道感染', suggestion: '多喝水，注意保暖' },
    { chiefComplaint: '胃痛、反酸1周', diagnosis: '慢性胃炎', suggestion: '规律饮食，忌辛辣' },
    { chiefComplaint: '胸闷、气短', diagnosis: '心律不齐', suggestion: '避免剧烈运动，定期复查' },
    { chiefComplaint: '腰痛2个月', diagnosis: '腰椎间盘突出', suggestion: '卧床休息，理疗' },
    { chiefComplaint: '关节疼痛', diagnosis: '风湿性关节炎', suggestion: '注意保暖，按时服药' },
    { chiefComplaint: '皮肤瘙痒', diagnosis: '过敏性皮炎', suggestion: '避免接触过敏原' },
    { chiefComplaint: '失眠多梦', diagnosis: '神经衰弱', suggestion: '调整作息，放松心情' },
  ];

  const medicalRecordsCreated: { id: number; appointmentId: number }[] = [];
  for (const apt of completedAppointments) {
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { appointmentId: apt.id },
    });
    if (existingRecord) continue;

    const diagnosisInfo = diagnosisList[Math.floor(Math.random() * diagnosisList.length)];
    try {
      const record = await prisma.medicalRecord.create({
        data: {
          recordNo: generateNo('BL'),
          patientId: apt.patientId,
          doctorId: apt.doctorId,
          appointmentId: apt.id,
          chiefComplaint: diagnosisInfo.chiefComplaint,
          presentIllness: `患者${diagnosisInfo.chiefComplaint}，无明显诱因，自行服药无效。`,
          diagnosis: diagnosisInfo.diagnosis,
          suggestion: diagnosisInfo.suggestion,
        },
      });
      medicalRecordsCreated.push({ id: record.id, appointmentId: apt.id });
    } catch (e) {
      // 忽略错误
    }
  }
  console.log('创建病历:', medicalRecordsCreated.length);

  // 17. 创建处方数据
  const allMedicines = await prisma.medicine.findMany();
  const prescriptionsCreated: number[] = [];

  for (const record of medicalRecordsCreated) {
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id: record.id },
    });
    if (!medicalRecord) continue;

    // 随机选择1-3种药品
    const numMedicines = Math.floor(Math.random() * 3) + 1;
    const selectedMedicines = allMedicines
      .sort(() => Math.random() - 0.5)
      .slice(0, numMedicines);

    let totalAmount = 0;
    const items = selectedMedicines.map((med) => {
      const quantity = Math.floor(Math.random() * 3) + 1;
      const subtotal = Number(med.price) * quantity;
      totalAmount += subtotal;
      return {
        medicineId: med.id,
        quantity,
        dosage: '每日3次，每次1粒',
        unitPrice: med.price,
        subtotal,
      };
    });

    try {
      const prescription = await prisma.prescription.create({
        data: {
          prescriptionNo: generateNo('CF'),
          patientId: medicalRecord.patientId,
          doctorId: medicalRecord.doctorId,
          medicalRecordId: record.id,
          totalAmount,
          advice: '按时服药，如有不适请及时就医',
          status: Math.floor(Math.random() * 3), // 0:待缴费 1:已缴费 2:已取药
          items: {
            create: items,
          },
        },
      });
      prescriptionsCreated.push(prescription.id);
    } catch (e) {
      // 忽略错误
    }
  }
  console.log('创建处方:', prescriptionsCreated.length);

  // 18. 创建体检预约数据
  const allExamItems = await prisma.examItem.findMany();
  const examinationsCreated: number[] = [];

  for (let i = 0; i < 10; i++) {
    const patient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
    const numItems = Math.floor(Math.random() * 4) + 2;
    const selectedExamItems = [...allExamItems].sort(() => Math.random() - 0.5).slice(0, numItems);
    const totalAmount = selectedExamItems.reduce((sum, item) => sum + Number(item.price), 0);

    try {
      const examination = await prisma.examination.create({
        data: {
          examNo: generateNo('TJ'),
          patientId: patient.id,
          examDate: randomFutureDate(14),
          totalAmount,
          status: Math.floor(Math.random() * 3),
          items: {
            create: selectedExamItems.map((item) => ({
              examItemId: item.id,
              status: Math.floor(Math.random() * 2),
            })),
          },
        },
      });
      examinationsCreated.push(examination.id);
    } catch (e) {
      // 忽略错误
    }
  }
  console.log('创建体检预约:', examinationsCreated.length);

  // 19. 创建缴费记录
  const paymentsCreated: number[] = [];
  const prescriptions = await prisma.prescription.findMany({ where: { status: { gte: 1 } }, take: 10 });

  for (const prescription of prescriptions) {
    try {
      const payment = await prisma.payment.create({
        data: {
          paymentNo: generateNo('PAY'),
          patientId: prescription.patientId,
          prescriptionId: prescription.id,
          type: 'prescription',
          amount: prescription.totalAmount,
          payMethod: ['balance', 'wechat', 'alipay'][Math.floor(Math.random() * 3)],
          status: 1,
          paidAt: randomPastDate(30),
        },
      });
      paymentsCreated.push(payment.id);
    } catch (e) {
      // 忽略错误
    }
  }
  console.log('创建缴费记录:', paymentsCreated.length);

  // 20. 创建充值记录
  const rechargesCreated: number[] = [];
  for (let i = 0; i < 15; i++) {
    const patient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
    const amounts = [100, 200, 500, 1000];
    try {
      const recharge = await prisma.recharge.create({
        data: {
          rechargeNo: generateNo('RC'),
          patientId: patient.id,
          amount: amounts[Math.floor(Math.random() * amounts.length)],
          payMethod: ['wechat', 'alipay'][Math.floor(Math.random() * 2)],
          status: 1,
          paidAt: randomPastDate(60),
        },
      });
      rechargesCreated.push(recharge.id);
    } catch (e) {
      // 忽略错误
    }
  }
  console.log('创建充值记录:', rechargesCreated.length);

  // 21. 创建消息/咨询记录
  const messageContents = [
    { content: '请问挂号费可以用医保吗？', reply: '您好，我院支持医保挂号，请携带医保卡前来。' },
    { content: '体检报告多久可以出？', reply: '一般体检后3-5个工作日可以出结果，您可以在系统中查看。' },
    { content: '请问周末可以看专家门诊吗？', reply: '周末我院有部分专家出诊，具体请查看排班表。' },
    { content: '药品可以邮寄吗？', reply: '抱歉，处方药品需要本人凭处方到药房取药。' },
    { content: '如何办理就诊卡？', reply: '您可以在门诊大厅自助机办理，也可以到人工窗口办理。' },
  ];

  for (let i = 0; i < 20; i++) {
    const patient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
    const msgInfo = messageContents[Math.floor(Math.random() * messageContents.length)];
    const hasReply = Math.random() > 0.3;

    await prisma.message.create({
      data: {
        patientId: patient.id,
        content: msgInfo.content,
        reply: hasReply ? msgInfo.reply : null,
        isRead: hasReply,
        repliedAt: hasReply ? randomPastDate(7) : null,
        adminId: hasReply ? 1 : null,
      },
    });
  }
  console.log('创建消息记录: 20');

  // 22. 创建智能导诊记录
  const symptomsList = [
    { symptoms: '头痛、头晕、恶心', suggestedDept: '神经内科', suggestedDoc: '神经内科医生' },
    { symptoms: '咳嗽、发烧、喉咙痛', suggestedDept: '呼吸内科', suggestedDoc: '王强' },
    { symptoms: '胃痛、消化不良', suggestedDept: '消化内科', suggestedDoc: '赵雪' },
    { symptoms: '心慌、胸闷', suggestedDept: '心内科', suggestedDoc: '张明' },
    { symptoms: '关节疼痛、肿胀', suggestedDept: '骨科', suggestedDoc: '陈刚' },
    { symptoms: '月经不调', suggestedDept: '妇科', suggestedDoc: '吴芳' },
    { symptoms: '小儿发烧、咳嗽', suggestedDept: '小儿内科', suggestedDoc: '周丽' },
  ];

  for (let i = 0; i < 15; i++) {
    const patient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
    const symptom = symptomsList[Math.floor(Math.random() * symptomsList.length)];

    await prisma.diagnosisGuide.create({
      data: {
        guideNo: generateNo('DG'),
        patientId: Math.random() > 0.3 ? patient.id : null, // 部分游客使用
        symptoms: symptom.symptoms,
        suggestedDept: symptom.suggestedDept,
        suggestedDoc: symptom.suggestedDoc,
        aiResponse: `根据您描述的症状"${symptom.symptoms}"，建议您到${symptom.suggestedDept}就诊，推荐医生：${symptom.suggestedDoc}。`,
      },
    });
  }
  console.log('创建智能导诊记录: 15');

  console.log('数据初始化完成！');
  console.log('========================================');
  console.log('测试账号信息：');
  console.log('----------------------------------------');
  console.log('管理员账号: admin / admin123');
  console.log('医生账号: D001-D008 (工号) / doctor123');
  console.log('患者账号: patient, lisi, wangwu 等 / patient123');
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
