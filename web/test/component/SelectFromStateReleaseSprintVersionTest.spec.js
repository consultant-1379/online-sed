import { mount } from '@vue/test-utils';
import SelectFromStateProductSetVersion from '../../src/components/SelectFromStateProductSetVersion.vue';
import DropDownSelect from '../../src/components/DropDownSelectEmitOptionIndex.vue';


describe('SelectFromStateProductSetVersion', () => {
  test('renders the component with default props', () => {
    const fromModelObject = {
      versions: [{ name: '23.17.1' }, { name: '23.17.11' }],
      selectedVersion: { name: '23.17.11' },
      selectedSprint: { alias: '23.17' },
      selectedRelease: { alias: 'default' },
    }

    const toStateModelObject = {
      versions: [{ name: '23.17.1' }, { name: '23.17.11' }],
      selectedVersion: { name: '23.17.11' },
      selectedSprint: { alias: '23.17' },
      selectedRelease: { alias: 'default' },
    }

    const wrapper = mount(SelectFromStateProductSetVersion, {
      propsData: {
        fromModelObject,
        toStateModelObject
      },
    });

    expect(wrapper.exists()).to.be.true;
  });

  test('renders DropDownSelect with correct props', () => {

    const fromModelObject = {
      versions: [{ name: '23.17.1' }, { name: '23.17.10' }],
      selectedVersion: { name: '23.17.10' },
      selectedSprint: { alias: '23.17' },
      selectedRelease: { alias: 'default' },
    }

    const toStateModelObject = {
      versions: [{ name: '23.17.1' }, { name: '23.17.11' }],
      selectedVersion: { name: '23.17.11' },
      selectedSprint: { alias: '23.17' },
      selectedRelease: { alias: 'default' },
    }

    const wrapper = mount(SelectFromStateProductSetVersion, {
      propsData: {
        fromModelObject,
        displayHeadingContext: 'Test',
        toStateModelObject
      },
    });

    const dropDownSelect = wrapper.findComponent(DropDownSelect);

    expect(dropDownSelect.exists()).to.be.true;
    expect(dropDownSelect.props('options')).to.deep.equal(fromModelObject.versions);
    expect(dropDownSelect.props('displaykey')).to.be.equal('name');
    expect(dropDownSelect.props('default_option')).to.be.equal('23.17.10');
    expect(dropDownSelect.props('disabled')).to.be.false;
  });
});
