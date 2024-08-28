import { mount } from '@vue/test-utils';
import SelectIpVersion from '../../src/components/SelectIpVersion.vue';
import DropDownSelect from '../../src/components/DropDownSelectEmitOptionIndex.vue';

describe('SelectIpVersion', () => {
  test('renders the component', () => {
    const wrapper = mount(SelectIpVersion, {
      propsData: {
        modelObject: {
          ipVersions: [{ name: 'IPv4' }, { name: 'IPv6' }],
          selectedIpVersion: { name: 'IPv4' },
          artifactoryRepoData: {},
        },
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  test('renders DropDownSelect with correct props', () => {
    const modelObject = {
      ipVersions: [{ name: 'IPv4' }, { name: 'IPv6' }],
      selectedIpVersion: { name: 'IPv4' },
      artifactoryRepoData: {},
    };

    const wrapper = mount(SelectIpVersion, {
      propsData: {
        modelObject,
      },
    });

    const dropDownSelect = wrapper.findComponent(DropDownSelect);

    expect(dropDownSelect.exists()).to.be.true;

    expect(dropDownSelect.props('options')).to.deep.equal(modelObject.ipVersions);
    expect(dropDownSelect.props('displaykey')).to.be.equal('name');
    expect(dropDownSelect.props('default_option')).to.be.equal(modelObject.selectedIpVersion.name);
    expect(dropDownSelect.props('disabled')).to.be.equal(Object.keys(modelObject.artifactoryRepoData).length === 0);
  });
});
