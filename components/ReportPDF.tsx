import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ReportContent } from '@/types/report';

// 한글 폰트 등록
Font.register({
  family: 'Noto Sans KR',
  src: 'https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Regular.woff2',
});

Font.register({
  family: 'Noto Sans KR Bold',
  src: 'https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSansNeo/SpoqaHanSansNeo-Bold.woff2',
});

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Noto Sans KR',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'Noto Sans KR Bold',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Noto Sans KR Bold',
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10,
    fontFamily: 'Noto Sans KR',
  },
  list: {
    marginLeft: 20,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'Noto Sans KR',
  },
  disclaimer: {
    marginTop: 30,
    padding: 10,
    fontSize: 10,
    color: '#666666',
    fontFamily: 'Noto Sans KR',
  },
});

interface ReportPDFProps {
  content: ReportContent;
  title: string;
}

const ReportPDF = ({ content, title }: ReportPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* 제목 */}
      <View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* 요약 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>요약</Text>
        <Text style={styles.content}>
          {typeof content.summary === 'string' 
            ? content.summary 
            : content.summary.overview}
        </Text>
      </View>

      {/* 섹션들 */}
      {content.sections?.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.content}>{section.content}</Text>

          {/* 추천사항 */}
          {section.recommendations && section.recommendations.length > 0 && (
            <View style={styles.list}>
              <Text style={styles.sectionTitle}>추천사항:</Text>
              {section.recommendations.map((rec, idx) => (
                <Text key={idx} style={styles.listItem}>• {rec}</Text>
              ))}
            </View>
          )}

          {/* 참고자료 */}
          {section.references && section.references.length > 0 && (
            <View style={styles.list}>
              <Text style={styles.sectionTitle}>참고자료:</Text>
              {section.references.map((ref, idx) => (
                <Text key={idx} style={styles.listItem}>• {ref}</Text>
              ))}
            </View>
          )}
        </View>
      ))}

      {/* 결론 */}
      {content.conclusion && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결론</Text>
          <Text style={styles.content}>
            {typeof content.conclusion === 'string' 
              ? content.conclusion 
              : content.conclusion.summary}
          </Text>
        </View>
      )}

      {/* 고지사항 */}
      <View style={styles.disclaimer}>
        <Text>{content.disclaimer}</Text>
      </View>
    </Page>
  </Document>
);

export default ReportPDF; 