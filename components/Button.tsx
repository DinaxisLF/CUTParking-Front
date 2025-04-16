import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  TouchableOpacityProps,
} from "react-native";

interface CustomButtonProps extends TouchableOpacityProps {
  text?: string;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text = "Agregar",
  variant = "primary",
  icon,
  className = "",
  ...props
}) => {
  const variantClasses = {
    primary: "bg-primary-100/90",
    secondary: "bg-gray-200",
    danger: "bg-red-500",
  };

  return (
    <TouchableOpacity {...props}>
      <View
        className={`
      flex flex-row justify-center items-center 
      px-4 py-2 rounded-full 
      ${variantClasses[variant]} 
      ${className}
    `}
      >
        {icon && <View className="mr-2">{icon}</View>}
        <Text
          className={`
        text-xs font-rubik-extrabold 
        ${
          variant === "primary" || variant === "danger"
            ? "text-white"
            : "text-gray-800"
        }
        text-center // Añade esta clase
      `}
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;
