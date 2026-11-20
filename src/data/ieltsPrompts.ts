import type { IeltsPrompt } from '../types/ielts';

export const IELTS_PROMPTS: IeltsPrompt[] = [
  {
    id: 't2-remote-work',
    taskType: 'Task 2',
    category: 'Advantages & Disadvantages',
    topic: 'Work & Technology',
    title: 'Remote Work and Workplace Collaboration',
    prompt:
      'In many countries, a growing number of companies allow employees to work from home instead of commuting to a central office. Do the advantages of this trend outweigh the disadvantages for both employers and workers?',
    recommendedMinutes: 40,
    minWords: 250,
    sampleEssay: `The rapid advancement of cloud-based collaboration tools has enabled a structural shift away from traditional office attendance toward remote work. While working from home can diminish spontaneous teamwork and blur professional boundaries, I believe that its economic and productivity benefits decisively outweigh these drawbacks for both organizations and employees.

Admittedly, decentralized workplaces present tangible challenges to organizational cohesion. When staff operate exclusively from home, casual hallway interactions—often the catalyst for creative problem-solving—are largely eliminated, making it harder for junior employees to absorb institutional knowledge through observation. Furthermore, without physical separation between domestic and professional spheres, workers risk experiencing burnout as digital notifications extend well beyond conventional working hours.

Nevertheless, the advantages conferred by flexible work arrangements are far more consequential. For employees, eliminating daily commutes not only saves considerable time and disposable income, but also alleviates chronic stress, thereby improving overall job satisfaction and retention. For employers, adopting a distributed workforce drastically reduces overhead expenses associated with commercial real estate and utilities, while simultaneously widening the talent pool beyond geographical constraints. When supported by clear communication protocols and outcome-based performance metrics, remote teams consistently demonstrate equal or superior efficiency compared to their office-bound counterparts.

In conclusion, although remote work requires deliberate management to preserve team camaraderie and work-life boundaries, the substantial gains in cost efficiency, talent accessibility, and employee well-being make it an overwhelmingly positive development.`,
    examinerNotes:
      'Band 8.5 Benchmark: Clear position maintained throughout ("decisively outweigh"), balanced concession in Body 1, well-developed cause-and-effect chains in Body 2, and natural academic collocations without forced idioms.',
    sampleCollocations: [
      { phrase: 'structural shift', meaningVi: 'sự chuyển dịch mang tính cơ cấu' },
      { phrase: 'institutional knowledge', meaningVi: 'tri thức/kinh nghiệm nội bộ tổ chức' },
      { phrase: 'overhead expenses', meaningVi: 'chi phí vận hành cố định' },
      { phrase: 'catalyst for creative problem-solving', meaningVi: 'chất xúc tác cho việc giải quyết vấn đề sáng tạo' },
      { phrase: 'outcome-based performance metrics', meaningVi: 'thước đo hiệu suất dựa trên kết quả đầu ra' },
    ],
    starterDraft: `Nowadays, many companies let their staffs work from home instead of going to the office every day. While this trend have some disadvantages like feeling lonely, I think the advantages are much bigger for both workers and bosses.

First of all, working at home has some problems. When people do not meet face to face, it is hard to communicate and share ideas fast. Sometimes new workers cannot learn easily from older colleagues because they just talk on chat apps. Also, people may work too late at night because their laptop is always next to their bed, which make them very tired.

On the other hand, remote work brings a lot of good things. Workers do not need to waste time in traffic jams every morning, so they can spend more time with family or do exercise. They also save money on petrol and buying lunch outside. For companies, they do not need to rent a very big office in the city center, so they can save a huge amount of money. Besides, they can hire good workers from other cities or countries.

In conclusion, even though remote work can reduce face-to-face communication, I strongly believe that saving money, saving time and hiring better people make its benefits outweigh the drawbacks.`,
  },
  {
    id: 't2-public-transit',
    taskType: 'Task 2',
    category: 'Opinion (Agree / Disagree)',
    topic: 'Environment & Urbanization',
    title: 'Public Transport Investment vs. Highway Expansion',
    prompt:
      'Traffic congestion and air pollution are worsening in major cities worldwide. Some people argue that the best solution is for governments to invest heavily in free public transport rather than building wider roads. To what extent do you agree or disagree?',
    recommendedMinutes: 40,
    minWords: 250,
    sampleEssay: `Urban gridlock and deteriorating air quality have become defining challenges of modern metropolitan life. While expanding road networks is often proposed as a straightforward remedy, I strongly agree that prioritizing substantial public investment in fare-free transit systems represents a far more sustainable and effective long-term strategy.

Expanding highway capacity frequently fails to resolve congestion due to the well-documented phenomenon of induced demand. When authorities construct wider roads, driving temporarily becomes more convenient, which inadvertently incentivizes more residents to purchase private vehicles and abandon shared modes of travel. Within a few years, newly added lanes saturate once again, leaving municipalities with higher maintenance liabilities and even greater carbon emissions from internal combustion engines.

Conversely, subsidizing reliable, fare-free public transportation tackles both congestion and pollution at their structural root. By removing financial barriers to metro lines, electric buses, and commuter rail, governments make daily transit economically attractive for lower- and middle-income households. Admittedly, zero-fare transit alone cannot persuade affluent motorists to forfeit convenience unless accompanied by high service frequency and dedicated bus lanes. However, when mass transit is both free and punctual, a single train can displace hundreds of private cars from arterial roads, dramatically lowering per-capita emissions and reclaiming urban land from sprawling parking lots.

In summary, widening roads merely postpones traffic bottlenecks while exacerbating environmental degradation. Channeling public funds into accessible, fare-free mass transit offers the most viable pathway toward livable and low-carbon cities.`,
    examinerNotes:
      'Band 8.5+ Benchmark: Incorporates domain-accurate urban planning concepts ("induced demand", "arterial roads") seamlessly, with strong concession ("Admittedly...") and complex subordination.',
    sampleCollocations: [
      { phrase: 'urban gridlock', meaningVi: 'tình trạng kẹt xe nghiêm trọng tại đô thị' },
      { phrase: 'induced demand', meaningVi: 'nhu cầu phát sinh (xây thêm đường lại hút thêm xe)' },
      { phrase: 'maintenance liabilities', meaningVi: 'gánh nặng chi phí bảo trì' },
      { phrase: 'exacerbating environmental degradation', meaningVi: 'làm trầm trọng thêm suy thoái môi trường' },
      { phrase: 'per-capita emissions', meaningVi: 'lượng khí thải bình quân đầu người' },
    ],
    starterDraft: `Traffic jam and air pollution are becoming a big issue in many big cities around the world. Many people think governments should spend money on free public transport instead of making roads wider. I completely agree with this opinion.

First, building wider roads does not really fix traffic jams. When the road is bigger, more people want to buy private cars because driving looks easier. After a few years, the new road is full of cars again and air pollution gets even worse because of exhaust fumes.

Second, free public transport can encourage citizens to stop using motorbikes and cars. If buses and trains are free, poor people and students can save a lot of money every month. Of course, the government still needs to make sure the buses come on time and are clean. When many people take the subway together, there will be fewer vehicles on the street, which makes the air cleaner and reduces accidents.

To conclude, I agree that investing in free public transport is much better than expanding roads because it solves both traffic and environmental problems for the future.`,
  },
  {
    id: 't2-ai-education',
    taskType: 'Task 2',
    category: 'Discussion Both Views',
    topic: 'Education & AI',
    title: 'Vocational Skills vs. Pure Academic Research in Universities',
    prompt:
      'Some people believe that universities should focus primarily on preparing students for specific careers and practical employment skills. Others argue that higher education should prioritize critical thinking and pure academic research. Discuss both views and give your own opinion.',
    recommendedMinutes: 40,
    minWords: 250,
    sampleEssay: `As higher education becomes increasingly expensive, debate has intensified over whether universities should function primarily as vocational training grounds or as centers of theoretical inquiry. Although career-oriented instruction delivers immediate economic returns, I contend that an excessive emphasis on narrow job training undermines the enduring value of critical thinking and foundational research.

Proponents of practical curricula point to the pressing demands of a rapidly evolving labor market. With automation and artificial intelligence reshaping entire industries, graduates who possess specialized technical competencies—such as data analytics, software engineering, or clinical practice—can transition seamlessly into the workforce without prolonged unemployment. For students investing substantial tuition fees, industry-aligned coursework provides measurable financial security and satisfies employers seeking job-ready recruits.

Nevertheless, prioritizing purely vocational skills carries significant long-term risks. Specific software tools and industry procedures frequently become obsolete within a decade, leaving narrowly trained workers vulnerable to displacement. By contrast, rigorous engagement with pure academic research cultivates intellectual autonomy, analytical skepticism, and the ability to synthesize complex evidence—capacities that remain transferable across shifting economic landscapes. Moreover, many transformative technologies, from mRNA vaccines to modern computing architectures, originated in curiosity-driven university laboratories rather than short-term commercial training programs.

In my view, universities serve society best when they refuse to reduce education to mere job preparation. While optional internships can bridge theory and practice, the core mission of higher education must remain the cultivation of independent inquiry and foundational knowledge.`,
    examinerNotes:
      'Band 8.5 Benchmark: Gives balanced weight to both views before articulating a nuanced personal stance, using varied cohesive devices ("By contrast", "Moreover") without mechanical listing.',
    sampleCollocations: [
      { phrase: 'centers of theoretical inquiry', meaningVi: 'trung tâm nghiên cứu lý thuyết chuyên sâu' },
      { phrase: 'vulnerable to displacement', meaningVi: 'dễ bị đào thải/thay thế' },
      { phrase: 'intellectual autonomy', meaningVi: 'sự tự chủ về mặt tư duy trí tuệ' },
      { phrase: 'curiosity-driven university laboratories', meaningVi: 'các phòng thí nghiệm đại học nghiên cứu vì tri thức nền tảng' },
      { phrase: 'bridge theory and practice', meaningVi: 'thu hẹp khoảng cách giữa lý thuyết và thực tiễn' },
    ],
    starterDraft: `Nowadays people have different opinions about what universities should teach. Some think universities need to focus on job skills, while others believe critical thinking and academic research are more important. This essay will discuss both views and give my own idea.

On the one hand, teaching practical skills helps students find a job quickly after graduation. Because university tuition is very expensive today, students want to earn money soon. If schools teach coding, accounting or business skills, companies will be happy to hire them without spending time to retrain them.

On the other hand, academic research and critical thinking are very important for long-term success. Technology changes very fast, so the practical skills you learn today might not be useful in ten years. However, if students know how to think logically and solve new problems, they can learn anything in the future. Also, scientific research in universities helps create new medicine and technology for society.

In my opinion, universities should focus more on critical thinking and research, while adding some internships so students still understand how companies work.`,
  },
  {
    id: 't2-cultural-globalization',
    taskType: 'Task 2',
    category: 'Problem & Solution',
    topic: 'Culture & Society',
    title: 'Preserving Local Languages and Traditions in a Globalized Era',
    prompt:
      'Increasingly, young people around the world are adopting globalized lifestyles, clothing, and media, leading to the decline of local languages and cultural traditions. What are the causes of this trend, and what measures can governments and communities take to address it?',
    recommendedMinutes: 40,
    minWords: 250,
    sampleEssay: `Across continents, youth culture is converging around shared digital platforms, international fashion brands, and dominant global languages, often at the expense of indigenous dialects and ancestral customs. This cultural homogenization stems primarily from economic incentives and algorithmic media exposure, yet targeted educational policies and community-led digital initiatives can effectively reverse this erosion.

Two interconnected forces drive the retreat of local heritage among younger generations. First, globalized labor markets heavily reward fluency in major international languages such as English, compelling families to prioritize cosmopolitan skills over regional dialects that offer limited upward mobility. Second, transnational streaming services and social media algorithms overwhelmingly amplify Western and East Asian pop culture, inadvertently framing local traditions as antiquated or provincial in the eyes of impressionable adolescents.

Addressing this decline requires making cultural heritage both economically relevant and digitally engaging rather than relying solely on museum preservation. Governments should integrate regional languages and oral histories into primary school curricula, ensuring children acquire literacy in their ancestral tongues alongside global languages. Simultaneously, cultural ministries can fund local creators, filmmakers, and game developers to reinterpret traditional folklore through contemporary digital media. When indigenous music, cuisine, and craftsmanship are showcased on mainstream platforms and linked to sustainable cultural tourism, young people begin to view their heritage as a source of pride and livelihood rather than a relic of the past.

In conclusion, while economic globalization and digital algorithms accelerate cultural uniformity, bilingual education and modern creative subsidies can empower younger generations to safeguard their distinctive identities.`,
    examinerNotes:
      'Band 8.5 Benchmark: Directly answers both questions (causes + concrete measures) with precise socio-cultural vocabulary ("cultural homogenization", "upward mobility", "antiquated").',
    sampleCollocations: [
      { phrase: 'cultural homogenization', meaningVi: 'sự đồng nhất hóa văn hóa' },
      { phrase: 'upward mobility', meaningVi: 'cơ hội thăng tiến xã hội/kinh tế' },
      { phrase: 'algorithmic media exposure', meaningVi: 'sự tiếp cận truyền thông qua thuật toán' },
      { phrase: 'antiquated or provincial', meaningVi: 'lỗi thời hoặc cục bộ địa phương' },
      { phrase: 'safeguard their distinctive identities', meaningVi: 'bảo vệ bản sắc riêng biệt' },
    ],
    starterDraft: `Today many young people follow global trends in clothes, music and movies, so local languages and traditions are disappearing. This essay will explain why this happens and suggest some ways to solve it.

There are two main reasons for this problem. Firstly, young people spend many hours on TikTok and YouTube, where most famous videos use English or global pop culture. This makes them feel their own traditional music or clothes are boring and old-fashioned. Secondly, learning English helps them get a high-paying job in international companies, while local dialects do not help much for their career.

To solve this issue, governments and communities should take action. Governments can put local history and language lessons in schools so kids learn them from a young age. Also, communities should organize fun cultural festivals and support young artists to make modern videos or games about local legends. When traditional culture looks cool on social media, young people will want to protect it.

In conclusion, global media and job needs cause the loss of local culture, but education and modern media projects can keep traditions alive.`,
  },
  {
    id: 't1-renewable-line',
    taskType: 'Task 1',
    category: 'Line Graph',
    topic: 'Energy & Environment',
    title: 'Global Renewable Electricity Generation by Source (2000–2025)',
    prompt:
      'The line graph below shows electricity generation from three renewable energy sources (Hydropower, Wind, and Solar) in Terawatt-hours (TWh) globally between 2000 and 2025. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    recommendedMinutes: 20,
    minWords: 150,
    chartData: {
      kind: 'line',
      title: 'Global Renewable Electricity Generation (TWh), 2000–2025',
      unit: 'TWh',
      xLabels: ['2000', '2005', '2010', '2015', '2020', '2025'],
      series: [
        { name: 'Hydropower', color: '#1E3A8A', values: [2650, 2920, 3430, 3890, 4350, 4580] },
        { name: 'Wind', color: '#059669', values: [31, 104, 342, 831, 1590, 2490] },
        { name: 'Solar', color: '#D97706', values: [1, 4, 32, 256, 845, 1980] },
      ],
    },
    sampleEssay: `The line graph illustrates the volume of global electricity generated from hydropower, wind, and solar power, measured in terawatt-hours (TWh), over a 25-year period from 2000 to 2025.

Overall, electricity production from all three renewable sources increased substantially over the timeframe. While hydropower remained the dominant contributor throughout, wind and solar experienced exponential expansion after 2010, dramatically narrowing the gap with hydroelectricity by 2025.

In 2000, hydropower already accounted for 2,650 TWh of global electricity, whereas wind and solar generation were negligible at just 31 TWh and 1 TWh, respectively. Over the subsequent decade, hydro output rose steadily to 3,430 TWh in 2010, and continued a moderate upward trajectory to reach 4,580 TWh in 2025.

In contrast, wind and solar power underwent rapid acceleration during the second half of the period. Wind generation climbed from 342 TWh in 2010 to 1,590 TWh in 2020 before surging to 2,490 TWh by 2025—more than half the output of hydropower. Solar energy exhibited the steepest proportional growth, rising nearly eightfold between 2010 and 2015 (from 32 to 256 TWh) and skyrocketing to 1,980 TWh in 2025.`,
    examinerNotes:
      'Band 8.5 Task 1 Benchmark: Concise paraphrased intro, crystal-clear Overview identifying both the overall upward trend and the structural catch-up of wind/solar, accurate data grouping without mechanical year-by-year listing.',
    sampleCollocations: [
      { phrase: 'exponential expansion', meaningVi: 'sự mở rộng theo cấp số nhân' },
      { phrase: 'moderate upward trajectory', meaningVi: 'quỹ đạo tăng trưởng ổn định ở mức vừa phải' },
      { phrase: 'steepest proportional growth', meaningVi: 'tốc độ tăng trưởng theo tỷ lệ dốc nhất' },
      { phrase: 'narrowing the gap', meaningVi: 'thu hẹp khoảng cách' },
    ],
    starterDraft: `The line graph shows how much electricity was made from hydropower, wind and solar in the world from 2000 to 2025.

Overall, all three energy sources went up during the period. Hydropower was always the biggest source, while wind and solar grew very fast after 2010.

In 2000, hydropower produced 2650 TWh. Wind only made 31 TWh and solar was very small at 1 TWh. By 2010, hydropower increased to 3430 TWh, wind rose to 342 TWh and solar was 32 TWh.

From 2015 to 2025, wind and solar increased rapidly. Hydropower reached 4580 TWh in 2025. Wind jumped from 831 TWh in 2015 to 2490 TWh in 2025. Solar also grew quickly from 256 TWh in 2015 to 845 TWh in 2020 and finally reached 1980 TWh in 2025.`,
  },
  {
    id: 't1-graduate-bar',
    taskType: 'Task 1',
    category: 'Bar Chart',
    topic: 'Higher Education & Employment',
    title: 'Graduate Full-Time Employment Rates by Discipline (2024)',
    prompt:
      'The bar chart compares the percentage of university graduates in full-time employment within six months of graduation across four academic fields in three countries in 2024. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    recommendedMinutes: 20,
    minWords: 150,
    chartData: {
      kind: 'bar',
      title: 'Full-Time Graduate Employment Within 6 Months (%), 2024',
      unit: '%',
      xLabels: ['Engineering', 'Health Sciences', 'Business', 'Humanities'],
      series: [
        { name: 'Germany', color: '#1E3A8A', values: [86, 89, 78, 54] },
        { name: 'Canada', color: '#059669', values: [81, 84, 74, 58] },
        { name: 'Japan', color: '#475569', values: [88, 82, 83, 66] },
      ],
    },
    sampleEssay: `The bar chart illustrates the proportion of university graduates securing full-time employment within six months of completing their degrees across four disciplines in Germany, Canada, and Japan in 2024.

Overall, graduates in applied technical and healthcare fields achieved substantially higher early employment rates than those in humanities across all three nations. Notably, Japan recorded the highest employment figures in business and humanities, whereas Germany led in health sciences.

In Engineering and Health Sciences, employment prospects were consistently strong, exceeding 80% in every country surveyed. Germany posted the highest overall figure on the chart in Health Sciences at 89%, closely followed by Canada (84%) and Japan (82%). Conversely, Japan narrowly outperformed Germany in Engineering, with 88% compared to Germany's 86%, while Canada stood slightly lower at 81%.

A wider divergence emerged in Business and Humanities. Japan maintained an 83% employment rate for Business graduates, outpacing Germany (78%) and Canada (74%). Humanities graduates experienced the lowest employment rates across the board, though Japan still registered a markedly stronger outcome at 66%, compared with 58% in Canada and just 54% in Germany.`,
    examinerNotes:
      'Band 8.5 Task 1 Benchmark: Groups disciplines logically (high-performing STEM/Health vs. Business/Humanities) rather than reading bar-by-bar, highlighting exact extremes (89% peak vs 54% trough).',
    sampleCollocations: [
      { phrase: 'securing full-time employment', meaningVi: 'tìm được việc làm toàn thời gian' },
      { phrase: 'applied technical and healthcare fields', meaningVi: 'các lĩnh vực kỹ thuật ứng dụng và y tế' },
      { phrase: 'narrowly outperformed', meaningVi: 'vượt qua với khoảng cách sít sao' },
      { phrase: 'across the board', meaningVi: 'trên tất cả các nhóm/lĩnh vực' },
    ],
    starterDraft: `The bar chart compares the percentage of university graduates who got full-time jobs within 6 months in four subjects in Germany, Canada and Japan in 2024.

Overall, Engineering and Health Sciences had the highest employment rates in all three countries, while Humanities had the lowest percentage.

For Health Sciences, Germany was the highest at 89%, Canada was 84% and Japan was 82%. For Engineering, Japan was slightly higher than Germany with 88% and 86%, and Canada was 81%.

In Business, Japan had 83%, which was more than Germany at 78% and Canada at 74%. Finally, Humanities had the lowest numbers. Germany was only 54%, Canada was 58%, and Japan was the highest in this group with 66%.`,
  },
  {
    id: 't1-water-table',
    taskType: 'Task 1',
    category: 'Data Table',
    topic: 'Urban Resources',
    title: 'Domestic Water Consumption Across Five Cities',
    prompt:
      'The table provides data on daily domestic water consumption per person (in liters) across five major cities, broken down by four household activities. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    recommendedMinutes: 20,
    minWords: 150,
    chartData: {
      kind: 'table',
      title: 'Daily Domestic Water Use per Person (Liters)',
      headers: ['City', 'Shower & Bath', 'Toilet', 'Laundry', 'Cooking & Drinking', 'Total'],
      rows: [
        ['Singapore', 52, 26, 30, 14, 122],
        ['Melbourne', 58, 28, 34, 16, 136],
        ['London', 49, 35, 29, 15, 128],
        ['Tokyo', 66, 44, 42, 22, 174],
        ['Toronto', 84, 48, 52, 24, 208],
      ],
    },
    sampleEssay: `The table compares average daily per-capita domestic water usage, measured in liters, across four household activities in Singapore, Melbourne, London, Tokyo, and Toronto.

Overall, Toronto recorded by far the highest total water consumption, whereas Singapore was the most water-efficient city. Across all five cities, showering and bathing consistently accounted for the largest share of household water use, while cooking and drinking consumed the least.

Toronto residents used a total of 208 liters per person daily—nearly 70% more than their counterparts in Singapore (122 liters). Tokyo ranked second highest at 174 liters, while Melbourne and London occupied the middle tier at 136 and 128 liters, respectively.

When examining individual categories, showering and bathing represented roughly 38% to 43% of total usage in every city, ranging from 49 liters in London and 52 in Singapore up to 84 liters in Toronto. Toilet flushing and laundry constituted the next largest proportions, with London notably exhibiting higher toilet usage (35 liters) than laundry usage (29 liters), unlike the other four cities where laundry equaled or exceeded toilet consumption. Cooking and drinking remained remarkably modest everywhere, between 14 and 24 liters per day.`,
    examinerNotes:
      'Band 8.5 Task 1 Benchmark: Synthesizes both city totals and category shares, spotting the subtle exception in London where toilet flushing exceeded laundry.',
    sampleCollocations: [
      { phrase: 'per-capita domestic water usage', meaningVi: 'lượng nước sinh hoạt bình quân đầu người' },
      { phrase: 'most water-efficient city', meaningVi: 'thành phố sử dụng nước tiết kiệm nhất' },
      { phrase: 'occupied the middle tier', meaningVi: 'nằm ở nhóm trung bình' },
      { phrase: 'remarkably modest', meaningVi: 'ở mức khiêm tốn đáng kể' },
    ],
    starterDraft: `The table shows how much water each person uses every day for four home activities in five cities: Singapore, Melbourne, London, Tokyo and Toronto.

Overall, Toronto used the most water in total and Singapore used the least. Also, showering and bathing took the biggest amount of water in all cities.

In total, one person in Toronto used 208 liters per day, followed by Tokyo with 174 liters. Melbourne used 136 liters, London used 128 liters, and Singapore was lowest at 122 liters.

Looking at the activities, shower and bath was 84 liters in Toronto and 66 liters in Tokyo, while London was only 49 liters. For toilet and laundry, Toronto also had the highest numbers at 48 and 52 liters. Cooking and drinking used the smallest amount in every city, from 14 liters in Singapore to 24 liters in Toronto.`,
  },
];
