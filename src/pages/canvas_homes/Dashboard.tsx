import Layout from '../../layout/Layout'
import StateBaseTextFieldTest from '../../components/design-elements/StateBaseTextField_Test'
import ButtonTestExamples from '../../components/design-elements/Button_Test'
import SelectionButtonsGroupTest from '../../components/design-elements/SelectionButtonsGroup_Test'
import FlexibleTableTest from '../../components/design-elements/FlexibleTable_Test'

const Dashboard = () => {
    return (
        <Layout loading={false}>
            <StateBaseTextFieldTest />
            <ButtonTestExamples />
            <SelectionButtonsGroupTest />
            <FlexibleTableTest />
        </Layout>
    )
}

export default Dashboard
