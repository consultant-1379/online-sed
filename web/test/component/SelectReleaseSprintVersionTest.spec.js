import { mount } from '@vue/test-utils';
import SelectProductSetVersion from '../../src/components/SelectProductSetVersion.vue';
import DropDownSelect from '../../src/components/DropDownSelectEmitOptionIndex.vue';


describe('SelectProductSetVersion', () => {
  test('renders the component with default props', () => {
    const modelObject = {
      versions: [{ name: '23.17.1' }, { name: '23.17.10' }],
      selectedVersion: { name: '23.17.10' },
      selectedSprint: { alias: '23.17' },
      selectedRelease: { alias: 'default' },
    }

    const wrapper = mount(SelectProductSetVersion, {
      propsData: {
        modelObject,
      },
    });

    expect(wrapper.exists()).to.be.true;
  });

  test('renders DropDownSelect with correct props', () => {
    const modelObject = {
      versions: [{ name: '23.17.1' }, { name: '23.17.10' }],
      selectedVersion: { name: '23.17.10' },
      selectedSprint: { alias: '23.17' },
      selectedRelease: { alias: 'default' },
    };

    const wrapper = mount(SelectProductSetVersion, {
      propsData: {
        modelObject,
        displayHeadingContext: 'Test'
      },
    });

    const dropDownSelect = wrapper.findComponent(DropDownSelect);

    expect(dropDownSelect.exists()).to.be.true;
    expect(dropDownSelect.props('options')).to.deep.equal(modelObject.versions);
    expect(dropDownSelect.props('displaykey')).to.be.equal('name');
    expect(dropDownSelect.props('default_option')).to.be.equal('23.17.10');
    expect(dropDownSelect.props('disabled')).to.be.false;
  });
});
