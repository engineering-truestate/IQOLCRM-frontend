
import Layout from "../../layout/Layout"
import StateBaseTextFieldTest from "../../components/design-elements/StateBaseTextField_Test"
import ButtonTestExamples from "../../components/design-elements/Button_Test"

const Dashboard = () => {
  return (
    <Layout loading={false}>
      <StateBaseTextFieldTest />
      <ButtonTestExamples />
    </Layout>
  )
}

export default Dashboard
