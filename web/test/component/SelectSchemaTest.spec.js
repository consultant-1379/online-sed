import { mount } from '@vue/test-utils';
import SelectSchema from '../../src/components/SelectSchema.vue';
import DropDownSelect from "../../src/components/DropDownSelectEmitOptionIndex.vue";

describe('SelectSchema', () => {
  test('renders the component with default props', () => {
    const modelObject = {
      sizes: [{ name: 'small' }, { name: 'test' }, { name: 'medium' }],
      selectedSize: { name: 'Size 1' },
      schemas: [{ shortName: 'Schema 1' }, { shortName: 'Schema 2' }],
      selectedSchema: { shortName: 'Schema 1' },
      selectedIpVersion: { alias: 'default' },
      targetAudience: 'pdu',
      selectedProduct: {shortName: "pENM"}
    };
    const wrapper = mount(SelectSchema, {
      propsData: {
        modelObject,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  test('renders the component with specified targetAudience', () => {
    const modelObject = {
      sizes: [{ name: 'small' }, { name: 'test' }, { name: 'medium' }],
      selectedSize: { name: 'Size 1' },
      schemas: [{ shortName: 'Schema 1' }, { shortName: 'Schema 2' }],
      selectedSchema: { shortName: 'Schema 1' },
      selectedIpVersion: { alias: 'default' },
      targetAudience: 'cu',
      selectedProduct: {shortName: "pENM"}
    };
    const wrapper = mount(SelectSchema, {
      propsData: {
        modelObject,
      },
    });
    const options = wrapper.vm.filterSizes(modelObject.sizes);
    expect(options.some((option) => option.name === 'test')).to.be.false;
  });

  test('renders the component with specified targetAudience in cENM product', () => {
    const modelObject = {
      sizes: [{ name: 'small',displayInExternalSED: true }, { name: 'singleInstance',displayInExternalSED: false }, { name: 'extraLarge',displayInExternalSED: true }, { name: 'multiInstance',displayInExternalSED: false }],
      selectedSize: { name: 'Size 1' },
      schemas: [{ shortName: 'Schema 1' }, { shortName: 'Schema 2' }],
      selectedSchema: { shortName: 'Schema 1' },
      selectedIpVersion: { alias: 'default' },
      targetAudience: 'cu',
      selectedProduct: {shortName: "cENM"}
    };
    const wrapper = mount(SelectSchema, {
      propsData: {
        modelObject,
      },
    });
    const options = wrapper.vm.filterSizes(modelObject.sizes);
    expect(options.some((option) => option.name === 'singleInstance')).to.be.false;
    expect(options.some((option) => option.name === 'multiInstance')).to.be.false;
  });

  test('renders DropDownSelect with correct props -- pdu', async () => {
    const modelObject = {
      sizes: [{ name: 'small' }, { name: 'medium' }],
      selectedSize: { name: 'small' },
      schemas: [{ shortName: 'Schema 1' }, { shortName: 'Schema 2' }],
      selectedSchema: { shortName: 'Schema 1' },
      selectedIpVersion: { alias: 'upgrade' },
      targetAudience: 'pdu',
      selectedProduct: {shortName: "pENM"}
    };

    const wrapper = mount(SelectSchema, {
      propsData: {
        modelObject,
      },
    });

    const dropDownSelect = wrapper.findComponent(DropDownSelect);
    expect(dropDownSelect.exists()).to.be.true;
    expect(dropDownSelect.props('options')).to.deep.equal(modelObject.sizes);
    expect(dropDownSelect.props('displaykey')).to.be.equal('name');
    expect(dropDownSelect.props('default_option')).to.be.equal('small');
    expect(dropDownSelect.props('disabled')).to.be.false;
  });

  test('renders DropDownSelect with correct props -- cu', async () => {
    const modelObject = {
      sizes: [{ name: 'small' }, { name: 'test' }, { name: 'medium' }],
      selectedSize: { name: 'Size 1' },
      schemas: [{ shortName: 'Schema 1' }, { shortName: 'Schema 2' }],
      selectedSchema: { shortName: 'Schema 1' },
      selectedIpVersion: { alias: 'upgrade' },
      targetAudience: 'cu',
      selectedProduct: {name: "Physical ENM", shortName: "pENM"}
    };

    const wrapper = mount(SelectSchema, {
      propsData: {
        modelObject,
      },
    });

    const dropDownSelects = wrapper.findAllComponents(DropDownSelect);

    const sizeDropDownSelect = dropDownSelects[0];
    expect(sizeDropDownSelect.exists()).to.be.true;
    expect(sizeDropDownSelect.props('options')).to.deep.equal([{ name: 'small' }, { name: 'medium' }]);
    expect(sizeDropDownSelect.props('displaykey')).to.be.equal('name');
    expect(sizeDropDownSelect.props('default_option')).to.be.equal('Size 1');
    expect(sizeDropDownSelect.props('disabled')).to.be.false;

    const schemaDropDownSelect = dropDownSelects[1];
    expect(schemaDropDownSelect.exists()).to.be.true;
    expect(schemaDropDownSelect.props('options')).to.deep.equal(modelObject.schemas);
    expect(schemaDropDownSelect.props('displaykey')).to.be.equal('shortName');
    expect(schemaDropDownSelect.props('default_option')).to.be.equal('Schema 1');
    expect(schemaDropDownSelect.props('disabled')).to.be.false;
  });

  test('check dropdowns is disabled when selectedIpVersions and selectedSize is not set', async () => {
    const modelObject = {
      sizes: [{ name: 'Size 1' }, { name: 'Size 2' }],
      selectedSize: { alias: 'default' },
      schemas: [{ shortName: 'Schema 1' }, { shortName: 'Schema 2' }],
      selectedSchema: { alias: 'default' },
      selectedIpVersion: { alias: 'default' },
      targetAudience: 'pdu',
      selectedProduct: {name: "Physical ENM", shortName: "pENM"}
    };
    const wrapper = mount(SelectSchema, {
      propsData: {
        modelObject,
      },
    });
    const dropDownSelects = wrapper.findAllComponents(DropDownSelect);
    const sizeDropDownSelect = dropDownSelects[0];
    const schemaDropDownSelect = dropDownSelects[1];
    expect(sizeDropDownSelect.props('disabled')).to.be.true;
    expect(schemaDropDownSelect.props('disabled')).to.be.true;
  });
});

