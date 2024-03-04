import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const SelectModel = ({
  selectedModel,
  handleModelChange,
}: {
  selectedModel: string | null;
  handleModelChange: (model: string) => void;
}) => (
  <div className='no-drag'>
    <Select
      value={selectedModel ?? ''}
      onValueChange={(value) => handleModelChange(value)}
    >
      <SelectTrigger className='a-icon w-[140px] h-5 border-none shadow-transparent bg-white dark:bg-[#606160] transition-all border border-zinc-600 focus:ring-0 focus-within:ring-0 focus-visible:ring-0 peer-focus-within:ring-0 text-neutral-800 dark:text-white'>
        <SelectValue placeholder='Select a model' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>AI Model</SelectLabel>
          <SelectItem value='llama'>LLama</SelectItem>
          <SelectItem value='mistralai/Mistral-7B-Instruct-v0.2'>Mistral</SelectItem>
          <SelectItem value='mlx-community/quantized-gemma-7b-it'>Gemma</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);

export default SelectModel;
