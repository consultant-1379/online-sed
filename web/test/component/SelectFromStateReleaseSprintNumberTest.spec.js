import { mount } from '@vue/test-utils';
import SelectReleaseSprintNumber from '../../src/components/SelectFromStateReleaseSprintNumber.vue';
import DropDownSelect from '../../src/components/DropDownSelectEmitOptionIndex.vue';


describe('SelectFromStateReleaseSprintNumberTest.spec', () => {
  test('renders the component test for targetAudience PDU', () => {
    const fromModelObject = {
      targetAudience: 'pdu',
      sprints: [{ sprintVersion: '23.16' }, { sprintVersion: '23.17' }],
      selectedSprint: { sprintVersion: '23.16' },
      selectedUseCase: { alias: 'upgrade' },
    };
    const toModelObject = {
      versions: [{ name: '23.17.1' }, { name: '23.17.11' }],
      selectedVersion: { name: '23.17.11' },
      selectedSprint: { alias: '23.17' },
      selectedRelease: { alias: 'default' },
    }

    const wrapper = mount(SelectReleaseSprintNumber, {
      propsData: {
        fromModelObject,
        toModelObject
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  test('renders the component targetAudience CU', () => {
    const fromModelObject = {
      targetAudience: 'cu',
      releases: [{ releaseNumber: '23.4' }, { releaseNumber: '24.1' }],
      selectedRelease: { releaseNumber: '24.1' },
      selectedUseCase: { alias: 'upgrade' },
    };
    const toModelObject = {
      versions: [{ name: '23.17.1' }, { name: '23.17.11' }],
      selectedVersion: { name: '23.17.11' },
      selectedSprint: { alias: '23.17' },
      selectedRelease: { alias: 'default' },
    }

    const wrapper = mount(SelectReleaseSprintNumber, {
      propsData: {
        fromModelObject,
        toModelObject
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  test('renders DropDownSelect with correct props targetAudience CU', () => {
    const fromModelObject = {
      targetAudience: 'pdu',
      sprints: [{ sprintVersion: '23.16' }, { sprintVersion: '23.17' }],
      selectedSprint: { sprintVersion: '23.16' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '23.16' }
    };
    const toModelObject = {
      versions: [{ name: '23.17.1' }, { name: '23.17.11' }],
      selectedVersion: { name: '23.17.11' },
      selectedSprint: { alias: '23.17' },
      selectedRelease: { alias: 'default' },
    }

    const wrapper = mount(SelectReleaseSprintNumber, {
      propsData: {
        fromModelObject,
        toModelObject,
        displayHeadingContext: 'Test'
      },
    });

    const dropDownSelect = wrapper.findComponent(DropDownSelect);

    expect(dropDownSelect.exists()).to.be.true;
    expect(dropDownSelect.props('options')).to.deep.equal(fromModelObject.sprints);
    expect(dropDownSelect.props('displaykey')).to.be.equal('sprintVersion');
    expect(dropDownSelect.props('default_option')).to.be.equal('23.16');
    expect(dropDownSelect.props('disabled')).to.be.false;
  });

  test('renders DropDownSelect with correct props targetAudience CU', () => {
    const fromModelObject = {
      targetAudience: 'cu',
      releases: [{ releaseNumber: '23.4' }, { releaseNumber: '24.1' }],
      selectedRelease: { releaseNumber: '24.1' },
      selectedUseCase: { alias: 'upgrade' },
      selectedVersion: { name: '24.1' }
    };
    const toModelObject = {
      versions: [{ name: '23.17.1' }, { name: '23.17.11' }],
      selectedVersion: { name: '23.17.11' },
      selectedSprint: { alias: '23.17' },
      selectedRelease: { alias: 'default' },
    }

    const wrapper = mount(SelectReleaseSprintNumber, {
      propsData: {
        fromModelObject,
        toModelObject,
        displayHeadingContext: 'Test'
      },
    });

    const dropDownSelect = wrapper.findComponent(DropDownSelect);

    expect(dropDownSelect.exists()).to.be.true;
    expect(dropDownSelect.props('options')).to.deep.equal(fromModelObject.releases);
    expect(dropDownSelect.props('displaykey')).to.be.equal('releaseNumber');
    expect(dropDownSelect.props('default_option')).to.be.equal('24.1');
    expect(dropDownSelect.props('disabled')).to.be.false;
  });
});
