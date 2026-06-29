import { useState } from 'react';
import { Pressable, Text, TextInput, type TextInputProps, View } from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, secureTextEntry, ...props }: FormFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-zinc-300">{label}</Text>
      <View className={`flex-row items-center rounded-2xl bg-surface px-4 ${error ? 'border border-red-500/60' : ''}`}>
        <TextInput
          {...props}
          className={`min-w-0 flex-1 py-4 text-base text-cream ${props.multiline ? 'min-h-28' : ''}`}
          placeholderTextColor="#6F6F73"
          secureTextEntry={secureTextEntry && !isVisible}
          selectionColor="#FF9D00"
          textAlignVertical={props.multiline ? 'top' : 'center'}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
            className="ml-3 py-2"
            onPress={() => setIsVisible((current) => !current)}
          >
            <Text className="text-sm font-semibold text-accent">{isVisible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="mt-2 text-sm text-red-400">{error}</Text> : null}
    </View>
  );
}
