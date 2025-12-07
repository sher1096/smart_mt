import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

  // 12. 创建测试患者
  const patientPassword = await bcrypt.hash('patient123', 10);
  const patient = await prisma.patient.upsert({
    where: { username: 'patient' },
    update: {},
    create: {
      username: 'patient',
      password: patientPassword,
      name: '测试患者',
      gender: 'male',
      phone: '13800138000',
      age: 30,
      status: 1,
    },
  });
  console.log('创建测试患者:', patient.username);

  console.log('数据初始化完成！');
  console.log('----------------------------------------');
  console.log('管理员账号: admin / admin123');
  console.log('医生账号: D001 (工号) / doctor123');
  console.log('患者账号: patient / patient123');
  console.log('----------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
